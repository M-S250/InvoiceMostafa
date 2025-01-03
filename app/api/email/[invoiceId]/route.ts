import prisma from "@/app/utils/db";
import { requireUser } from "@/app/utils/hooks";
import { emailClient } from "@/app/utils/mailtrap";
import { error } from "console";
import { NextResponse } from "next/server";


export async function POST(
    request: Request,
    { params }: {
        params: Promise<{ invoiceId: string }>
    }
) {
    try {
        const session = await requireUser();

        const { invoiceId } = await params
    
        const invoiceData = await prisma.invoice.findUnique({
            where: {
                id: invoiceId,
                userId: session.user?.id,
            },
        })
    
        if (!invoiceData) {
            return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
        }
    
        const sender = {
            email: "hello@demomailtrap.com",
            name: "Mostafa Salah",
        };
    
        emailClient.send({
            from: sender,
            to: [{ email: "mostafasalah2019u@gmail.com" }],
            template_uuid: "29e2e646-3fdb-44ab-8544-e9000067e0da",
            template_variables: {
              "company_info_name": "Invoice Mostafa"
            }
        })
    
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({error: "Failed to send Email reminder"} , {status: 500})
    }
};