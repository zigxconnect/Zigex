import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { authMiddleware } from "@/lib/middleware/auth";
import { eventSchema } from "@/lib/validation/event";

// Fetch a unique event from supabase
export async function GET(request: Request, { params }: { params: { id: string } }) {
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

  const eventId = params.id;

  // Fetch event from Supabase
    const {data, error} = await supabaseAdmin
      .from('event')
      .select('*')
      .eq('id', eventId)
      .eq('company_id', company.id)
      .single();

    if (error) {
      console.error('Supabase fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch event' },
        { status: 500 }
      );
    }
    return NextResponse.json(data);
}


// Delete event from supabase

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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

  const eventId = params.id;

  // Delete event from Supabase
    const {error} = await supabaseAdmin
      .from('event')
      .delete()
      .eq('id', eventId)
      .eq('company_id', company.id);

    if (error) {
      console.error('Supabase delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete event' },
        { status: 500 }
      );
    }
    return NextResponse.json({ message: 'Event deleted successfully' });
}


// Update event in supabase
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
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

    const eventId = params.id;

    const formData = await request.formData();
    //Extract image file
    const eventImage = formData.get('event_image') as File | null;

    // Validate other form fields by converting FormData to an object then use the eventSchema to validate
    const dataobject = Object.fromEntries(formData.entries());

    let eventImageUrl = ''

    //Ensure image is present
    if(eventImage) {

        //upload image to supabase storage and get the public URL
        //Set the image name and filepath. file path is company_name/events/event_title-timestamp.ext
        const imageExt = eventImage.name.split('.').pop();
        const imageName = `${dataobject.title}-${Date.now()}.${imageExt}`;
        const imagePath = `${company.company_name}/events/${imageName}`;


        //Upload the image to company-assets bucket in supabase storage
        const { error: uploadError } = await supabaseAdmin.storage
            .from('company-assets')
            .upload(imagePath, eventImage, {
            cacheControl: '3600',
            upsert: false
            });

            
        if (uploadError) {
            console.error('Supabase storage upload error:', uploadError);
            return NextResponse.json(
            { error: 'Failed to upload event image' },
            { status: 500 }
            );
        }

        //Get the public URL of the uploaded image
        const { data: imageData } = supabaseAdmin.storage
            .from('company-assets')
            .getPublicUrl(imagePath);
        eventImageUrl = imageData.publicUrl;
    }

    //validate data and add image url only if image url exists, that is if image was provided
    const validatedData = eventSchema.safeParse({...dataobject, ...(eventImageUrl != ''&&{event_picture_url: eventImageUrl})})

    // Update event in Supabase
    const { error } = await supabaseAdmin
        .from('events')
        .update(validatedData)
        .eq('id', eventId)
        .eq('company_id', company.id);

    if (error) {
        console.error('Supabase update error:', error);
        return NextResponse.json(
            { error: 'Failed to update event' },
            { status: 500 }
        );
    }
    return NextResponse.json({ message: 'Event updated successfully' });
}