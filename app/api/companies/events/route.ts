// api/companies/events/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase/server';
import { authMiddleware } from '@/lib/middleware/auth';
import { eventSchema } from '@/lib/validation/event';
import { v4 as uuidv4 } from 'uuid';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// Initialize Google Sheets connection
const getSpreadsheet = async () => {
  const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const doc = new GoogleSpreadsheet(process.env.EVENTS_SPREADSHEET_ID, serviceAccountAuth);
  await doc.loadInfo();
  return doc;
};

/**
 * @swagger
 * /api/companies/events:
 *   post:
 *     summary: Add a new event for a company with image upload
 *     description: Create a new event (conference, workshop, webinar, networking, hackathon) including an optional event picture. Data is stored in a spreadsheet.
 *     tags:
 *          - Company Events
 *     requestBody:
 *             required:
 *               - title
 *               - description
 *               - event_type
 *               - start_date
 *               - end_date
 *               - location
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Bad request (validation error)
 *       403:
 *         description: Unauthorized access
 *       404:
 *         description: Company profile not found
 *       500:
 *         description: Internal server error
 */

export async function GET(request: Request) {
  const auth = await authMiddleware(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { user, type } = auth;
  if (type !== 'company') {
    return NextResponse.json(
      { error: 'Unauthorized access' },
      { status: 403 }
    );
  }

  const { company } = auth;
  if (!company) {
    return NextResponse.json(
      { error: 'Company profile not found' },
      { status: 404 }
    );
  }

  try {
    // Read from spreadsheet instead of database
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle['Events'];
    const rows = await sheet.getRows();
    
    // Filter events by company_id
    const companyEvents = rows.filter(row => row.get('company_id') === company.id)
      .map(row => ({
        id: row.get('id'),
        title: row.get('title'),
        description: row.get('description'),
        event_type: row.get('event_type'),
        start_date: row.get('start_date'),
        end_date: row.get('end_date'),
        location: row.get('location'),
        registration_link: row.get('registration_link'),
        company_id: row.get('company_id'),
        event_picture_url: row.get('event_picture_url'),
        tags: row.get('tags') ? JSON.parse(row.get('tags')) : [],
        capacity: parseInt(row.get('capacity')) || null,
        is_virtual: row.get('is_virtual') === 'true',
        price: parseFloat(row.get('price')) || 0,
        created_at: row.get('created_at'),
        updated_at: row.get('updated_at')
      }));

    return NextResponse.json(companyEvents);
  } catch (error) {
    console.error('Error fetching events from spreadsheet:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const auth = await authMiddleware(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { user, type } = auth;
  if (type !== 'company') {
    return NextResponse.json(
      { error: 'Unauthorized access' },
      { status: 403 }
    );
  }

  const { company } = auth;
  if (!company) {
    return NextResponse.json(
      { error: 'Company profile not found' },
      { status: 404 }
    );
  }

  try {
    const formData = await request.formData();
    const eventPicture = formData.get('event_picture') as File | null;

    // Extract other fields
    const rawData: { [key: string]: any } = {};
    for (const [key, value] of formData.entries()) {
      if (key === 'tags' && typeof value === 'string') {
        rawData[key] = value.split(',').map(s => s.trim()).filter(s => s);
      } else if (key === 'capacity' && typeof value === 'string') {
        rawData[key] = parseInt(value) || null;
      } else if (key === 'price' && typeof value === 'string') {
        rawData[key] = parseFloat(value) || 0;
      } else if (key === 'is_virtual' && typeof value === 'string') {
        rawData[key] = value === 'true';
      } else if (key !== 'event_picture') {
        rawData[key] = value;
      }
    }

    // Add company_id before validation
    const validatedData = eventSchema.parse({
      ...rawData,
      company_id: company.id
    });

    let event_picture_url: string | undefined;

    // Handle image upload to Supabase Storage (if needed)
    if (eventPicture) {
      const fileExtension = eventPicture.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const filePath = `${company.id}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('event_pictures')
        .upload(filePath, eventPicture, {
          cacheControl: '3600',
          upsert: true,
          contentType: eventPicture.type
        });

      if (uploadError) {
        console.error('Supabase Storage upload error:', uploadError);
        return NextResponse.json(
          { error: `Failed to upload image: ${uploadError.message}` },
          { status: 500 }
        );
      }

      const { data: publicUrlData } = supabaseAdmin.storage
        .from('event_pictures')
        .getPublicUrl(filePath);

      event_picture_url = publicUrlData.publicUrl;
    }

    // Prepare data for spreadsheet
    const eventId = uuidv4();
    const now = new Date().toISOString();
    
    const eventData = {
      id: eventId,
      title: validatedData.title,
      description: validatedData.description,
      event_type: validatedData.event_type,
      start_date: validatedData.start_date,
      end_date: validatedData.end_date,
      location: validatedData.location,
      registration_link: validatedData.registration_link || '',
      company_id: validatedData.company_id,
      event_picture_url: event_picture_url || '',
      tags: JSON.stringify(validatedData.tags || []),
      capacity: validatedData.capacity || '',
      is_virtual: validatedData.is_virtual,
      price: validatedData.price,
      created_at: now,
      updated_at: now
    };

    // Insert event data into spreadsheet
    try {
      const doc = await getSpreadsheet();
      const sheet = doc.sheetsByTitle['Events'];
      await sheet.addRow(eventData);
      
      return NextResponse.json({
        ...validatedData,
        id: eventId,
        event_picture_url,
        created_at: now,
        updated_at: now
      }, { status: 201 });
    } catch (error) {
      console.error('Error writing to spreadsheet:', error);
      // Optionally, delete the uploaded image if spreadsheet insertion fails
      if (event_picture_url) {
        await supabaseAdmin.storage.from('event_pictures').remove([`${company.id}/${event_picture_url.split('/').pop()}`]);
      }
      return NextResponse.json(
        { error: 'Failed to save event to spreadsheet' },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error('Validation or processing error:', err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request) {
  const auth = await authMiddleware(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { user, type } = auth;
  if (type !== 'company') {
    return NextResponse.json(
      { error: 'Unauthorized access' },
      { status: 403 }
    );
  }

  const { company } = auth;
  if (!company) {
    return NextResponse.json(
      { error: 'Company profile not found' },
      { status: 404 }
    );
  }

  try {
    const formData = await request.formData();
    const eventPicture = formData.get('event_picture') as File | null;
    const eventId = formData.get('id') as string | null;

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required for updates' },
        { status: 400 }
      );
    }

    // Extract other fields
    const rawUpdates: { [key: string]: any } = {};
    for (const [key, value] of formData.entries()) {
      if (key === 'tags' && typeof value === 'string') {
        rawUpdates[key] = value.split(',').map(s => s.trim()).filter(s => s);
      } else if (key === 'capacity' && typeof value === 'string') {
        rawUpdates[key] = parseInt(value) || null;
      } else if (key === 'price' && typeof value === 'string') {
        rawUpdates[key] = parseFloat(value) || 0;
      } else if (key === 'is_virtual' && typeof value === 'string') {
        rawUpdates[key] = value === 'true';
      } else if (key !== 'event_picture' && key !== 'id') {
        rawUpdates[key] = value;
      }
    }

    // Validate partial updates
    const updates = eventSchema.partial().parse(rawUpdates);

    // Check if event exists and belongs to company
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle['Events'];
    const rows = await sheet.getRows();
    
    const eventRow = rows.find(row => 
      row.get('id') === eventId && row.get('company_id') === company.id
    );

    if (!eventRow) {
      return NextResponse.json(
        { error: 'Event not found or does not belong to this company' },
        { status: 404 }
      );
    }

    let event_picture_url: string | undefined = eventRow.get('event_picture_url') || undefined;

    // Handle new image upload
    if (eventPicture) {
      // Optional: Delete old image from storage if it exists
      const oldImageUrl = eventRow.get('event_picture_url');
      if (oldImageUrl) {
        const oldFileName = oldImageUrl.split('/').pop();
        if (oldFileName) {
          await supabaseAdmin.storage.from('event_pictures').remove([`${company.id}/${oldFileName}`]);
        }
      }

      const fileExtension = eventPicture.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const filePath = `${company.id}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('event_pictures')
        .upload(filePath, eventPicture, {
          cacheControl: '3600',
          upsert: true,
          contentType: eventPicture.type
        });

      if (uploadError) {
        console.error('Supabase Storage upload error:', uploadError);
        return NextResponse.json(
          { error: `Failed to upload new image: ${uploadError.message}` },
          { status: 500 }
        );
      }

      const { data: publicUrlData } = supabaseAdmin.storage
        .from('event_pictures')
        .getPublicUrl(filePath);

      event_picture_url = publicUrlData.publicUrl;
    }

    // Prepare updated data
    const updatedData: { [key: string]: any } = {
      ...updates,
      event_picture_url: event_picture_url || eventRow.get('event_picture_url'),
      updated_at: new Date().toISOString()
    };

    // Update event in spreadsheet
    Object.keys(updatedData).forEach(key => {
      if (key === 'tags') {
        eventRow.set(key, JSON.stringify(updatedData[key] || []));
      } else {
        eventRow.set(key, updatedData[key]);
      }
    });

    await eventRow.save();

    // Return the updated event
    const updatedEvent = {
      id: eventRow.get('id'),
      title: eventRow.get('title'),
      description: eventRow.get('description'),
      event_type: eventRow.get('event_type'),
      start_date: eventRow.get('start_date'),
      end_date: eventRow.get('end_date'),
      location: eventRow.get('location'),
      registration_link: eventRow.get('registration_link'),
      company_id: eventRow.get('company_id'),
      event_picture_url: eventRow.get('event_picture_url'),
      tags: eventRow.get('tags') ? JSON.parse(eventRow.get('tags')) : [],
      capacity: parseInt(eventRow.get('capacity')) || null,
      is_virtual: eventRow.get('is_virtual') === 'true',
      price: parseFloat(eventRow.get('price')) || 0,
      created_at: eventRow.get('created_at'),
      updated_at: eventRow.get('updated_at')
    };

    return NextResponse.json(updatedEvent);
  } catch (err) {
    console.error('Validation or processing error:', err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  const auth = await authMiddleware(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { user, type } = auth;
  if (type !== 'company') {
    return NextResponse.json(
      { error: 'Unauthorized access' },
      { status: 403 }
    );
  }

  const { company } = auth;
  if (!company) {
    return NextResponse.json(
      { error: 'Company profile not found' },
      { status: 404 }
    );
  }

  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required for deletion' },
        { status: 400 }
      );
    }

    // Find and verify event belongs to company
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle['Events'];
    const rows = await sheet.getRows();
    
    const eventRow = rows.find(row => 
      row.get('id') === id && row.get('company_id') === company.id
    );

    if (!eventRow) {
      return NextResponse.json(
        { error: 'Event not found or does not belong to this company' },
        { status: 404 }
      );
    }

    // Delete associated image from storage if it exists
    const eventImageUrl = eventRow.get('event_picture_url');
    if (eventImageUrl) {
      const fileName = eventImageUrl.split('/').pop();
      if (fileName) {
        await supabaseAdmin.storage
          .from('event_pictures')
          .remove([`${company.id}/${fileName}`])
          .catch(error => {
            console.warn('Failed to delete event image from storage:', error);
          });
      }
    }

    // Delete event from spreadsheet
    await eventRow.delete();

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Processing error:', err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 }
    );
  }
}