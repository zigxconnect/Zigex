import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase/client";
const internships = 'internship'

export  async function GET(req: NextApiRequest, res:NextApiResponse) {
    const {method, query} = req;

    const params = {id: query.id as string} 
    const id = params;

    if (method === 'GET'){
        try{
            if (!id || typeof id !== 'string'){
                return res.status(400).json({message: 'Invalid'})
            }

            const {data: internship, error} = await supabase
            .from(internships)
            .select(`*,company_profiles:company_id(*)`)
            .eq('id', id)
            .single();


            if (error) {
                console.error('Database error', error.message);
                if (error.code === 'PGRST116'){
                    return res.status(500).json({message: 'Internship not found'});
                }
                return res.status(500).json({message: 'Error getting Intenship'});
            }
            if (!internship){
                return res.status(400).json({message: "Internsgip not found"});
            }

            return res.status(200).json(internship);
        } catch (err){
            console.error("Unexpected error", err);
            return res.status(500).json({message: "Internal error"});
        }
    } else {
        res.setHeader('Allow',['GET']);
        res.status(405).end(' Not allowed');
    }
    
}