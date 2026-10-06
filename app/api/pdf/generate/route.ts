import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const pdfServiceUrl = process.env.PDF_SERVICE_URL || "http://localhost:3000/api/documents";

    const rawData = body.data || body;
    const sanitizedData = {
      ...rawData,
      notes: rawData.notes || "",
      quotationPdfUrl: rawData.quotationPdfUrl || "",
      statusHistory: rawData.statusHistory || [],
      items: Array.isArray(rawData.items)
        ? rawData.items.map((it: any) => ({
            ...it,
            description: it.description || "",
          }))
        : [],
    };

    // Forward the quotation data to PDF generator microservice
    const response = await fetch(pdfServiceUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: true,
        data: sanitizedData,
      }),
    });

    const text = await response.text();
    let data: any = null;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data?.message || `PDF Servisi Hatası (${response.status})`,
          detail: data,
        },
        { status: response.status }
      );
    }

    const targetId = body.data?.id || body.id;

    // Try extracting PDF URL from various potential response formats
    let pdfUrl =
      data?.url ||
      data?.data?.url ||
      data?.pdfUrl ||
      data?.data?.pdfUrl ||
      data?.downloadUrl ||
      (typeof data === "string" && data.startsWith("http") ? data : null);

    if (!pdfUrl && targetId) {
      pdfUrl = new URL(`/uploads/${encodeURIComponent(targetId)}.pdf`, pdfServiceUrl).href;
    }

    if (pdfUrl) {
      pdfUrl = new URL(pdfUrl, new URL("/", pdfServiceUrl)).href;
    }

    return NextResponse.json({
      success: true,
      pdfUrl: pdfUrl,
      data,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: err.message || "PDF üretim servisine bağlanılamadı.",
      },
      { status: 500 }
    );
  }
}
