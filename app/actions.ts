"use server";

import { requireUser } from "./utils/hooks";
import { parseWithZod } from "@conform-to/zod"
import { invoiceSchema, onboardingSchema } from "./utils/zodSchema";
import prisma from "./utils/db";
import { redirect } from "next/navigation";
import { emailClient } from "./utils/mailtrap";
import { formatCurrency } from "./utils/formatCurrency";

export async function onboardUser(prevState: unknown , formData: FormData) {
    const session = await requireUser();

    const submission = parseWithZod(formData , {
        schema: onboardingSchema,
    });

    if(submission.status !== "success"){
        return submission.reply();
    }

    const data = await prisma.user.update({
        where:{
            id: session.user?.id,
        },
        data:{
            firstName: submission.value.firstName,
            lastName: submission.value.lastName,
            address: submission.value.address
        }
    })

    return redirect("/dashboard")
}

export async function createInvoice(prevState: any , formData:FormData) {
    const session = await requireUser();

    const submission = parseWithZod(formData , {
        schema: invoiceSchema,
    })

    if(submission.status !== "success"){
        return submission.reply();
    }

    const data = await prisma.invoice.create({
        data:{
            clientAddress: submission.value.clientAddress,
            clientEmail: submission.value.clientEmail,
            clientName:submission.value.clientName,
            currency:submission.value.currency,
            date: submission.value.date,
            dueDate: submission.value.dueDate,
            fromAddress:submission.value.fromAddress,
            fromEmail:submission.value.fromEmail,
            fromName: submission.value.fromName,
            invoiceItemDescription: submission.value.invoiceItemDescription,
            invoiceItemQuantity: submission.value.invoiceItemQuantity,
            invoiceItemRate: submission.value.invoiceItemRate,
            invoiceName: submission.value.invoiceName,
            invoiceNumber: submission.value.invoiceNumber,
            status: submission.value.status,
            total: submission.value.total,
            note:submission.value.note,
            userId: session.user?.id,

        }
    });

    const sender = {
        email: "hello@demomailtrap.com",
        name: "Mostafa Salah",
      };

    emailClient.send({
        from: sender,
        to:[{email:"mostafasalah2019u@gmail.com"}],
        template_uuid: "92cf4768-f00d-4e2c-ab02-65e357f354fb",
        template_variables: {
          "clientName": submission.value.clientName,
          "invoiceNumber": submission.value.invoiceNumber,
          "dueDate": submission.value.date,
          "totalamount": new Intl.DateTimeFormat("en-US"  , {
            dateStyle:"long",
          }).format(new Date(submission.value.date)),
          "invoiceLink": `http://localhost:3000/api/invoice/${data.id}`
        }
    })

    return redirect("/dashboard/invoices")
}



export async function editInvoice(prevState: any , formData:FormData) {
    const session = await requireUser();

    const submission = parseWithZod(formData ,{
        schema: invoiceSchema,
    })

    if(submission.status !== "success"){
        return submission.reply();
    }

    const data = await prisma.invoice.update({
        where:{
            id: formData.get("id") as string,
            userId: session.user?.id,
        },
        data:{
            clientAddress: submission.value.clientAddress,
            clientEmail: submission.value.clientEmail,
            clientName:submission.value.clientName,
            currency:submission.value.currency,
            date: submission.value.date,
            dueDate: submission.value.dueDate,
            fromAddress:submission.value.fromAddress,
            fromEmail:submission.value.fromEmail,
            fromName: submission.value.fromName,
            invoiceItemDescription: submission.value.invoiceItemDescription,
            invoiceItemQuantity: submission.value.invoiceItemQuantity,
            invoiceItemRate: submission.value.invoiceItemRate,
            invoiceName: submission.value.invoiceName,
            invoiceNumber: submission.value.invoiceNumber,
            status: submission.value.status,
            total: submission.value.total,
            note:submission.value.note,
        }
    })

    const sender = {
        email: "hello@demomailtrap.com",
        name: "Mostafa Salah",
      };

    emailClient.send({
        from: sender,
        to:[{email:"mostafasalah2019u@gmail.com"}],
        template_uuid: "1b74d6e1-a05b-4898-b025-74f1c367b8e5",
        template_variables: {
          "clientName": submission.value.clientName,
          "invoiceNumber": submission.value.invoiceNumber,
          "dueDate": submission.value.date,
          "totalamount": new Intl.DateTimeFormat("en-US"  , {
            dateStyle:"long",
          }).format(new Date(submission.value.date)),
          "invoiceLink": `http://localhost:3000/api/invoice/${data.id}`
        }
    })

    return redirect("/dashboard/invoices")
}


export async function DeleteInvoice(invoiceId: string){
    const session = await requireUser();

    const data = await prisma.invoice.delete({
        where:{
            userId: session.user?.id,
            id: invoiceId,
        }
    })

    return redirect("/dashboard/invioces")
}

export async function MarkAsPaidAction(invoiceId: string){
    const session = await requireUser();

    const data = await prisma.invoice.update({
        where:{
            userId: session.user?.id,
            id:invoiceId,
        },
        data:{
            status: "PAID"
        }
    })

    return redirect("/dashboard/invoices")
}
