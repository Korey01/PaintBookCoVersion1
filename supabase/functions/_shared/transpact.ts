/**
 * _shared/transpact.ts
 *
 * Shared SOAP helper for all Transpact API calls.
 * Imported by: create-transpact, release-milestone-payment,
 *              void-transpact, get-transpact-status,
 *              transpact-webhook-receiver
 */

const TRANSPACT_ENDPOINT =
  "https://www.transpact.com/securepartner/partner.asmx";

export function buildSoapEnvelope(
  method: string,
  params: Record<string, string | number | boolean>,
): string {
  const paramXml = Object.entries(params)
    .map(([k, v]) => `<${k}>${v}</${k}>`)
    .join("\n      ");

  const paramXmlM = Object.entries(params)
    .map(([k, v]) => `<m:${k}>${v}</m:${k}>`)
    .join("\n      ");

  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope
  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:m="http://transpact.com/partners">
  <soap:Body>
    <m:${method}>
      ${paramXmlM}
    </m:${method}>
  </soap:Body>
</soap:Envelope>`;
}

export async function callTranspact(
  method: string,
  params: Record<string, string | number | boolean>,
): Promise<string> {
  const attempt = async (): Promise<string> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);
    try {
      const soapBody = buildSoapEnvelope(method, params);
      const res = await fetch(TRANSPACT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "text/xml; charset=utf-8",
          "SOAPAction": `http://transpact.com/partners/${method}`,
        },
        body: soapBody,
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!res.ok) {
        const body = await res.text();
        console.error("Transpact error body:", body);
        throw new Error(`Transpact HTTP ${res.status}: ${body.slice(0, 200)}`);
      }
      return res.text();
    } catch (e) {
      clearTimeout(timer);
      throw e;
    }
  };

  try {
    return await attempt();
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      await new Promise((r) => setTimeout(r, 2_000));
      return attempt();
    }
    throw err;
  }
}

export function parseTranspactResponse(xml: string, field: string): string {
  const match = xml.match(new RegExp(`<${field}>([^<]*)<\\/${field}>`));
  return match ? match[1] : "";
}

export function getAuthParams(): Record<string, string | boolean> {
  return {
    Username: Deno.env.get("TRANSPACT_USERNAME") ?? "",
    Password: Deno.env.get("TRANSPACT_PASSWORD") ?? "",
    IsTest: Deno.env.get("TRANSPACT_IS_TEST") === "true",
  };
}

const ERROR_MAP: Record<number, string> = {
  [-1]: "Invalid Transpact credentials. Please contact support.",
  [-2]: "A transaction for this reference already exists.",
  [-3]: "Invalid sender or recipient email address.",
  [-4]: "Invalid transaction amount.",
  [-5]: "Amount is below the minimum permitted threshold.",
  [-6]: "Conditions text exceeds the 4 000 character limit.",
  [-7]: "Invalid currency specified.",
  [-8]: "Invalid transaction type.",
  [-9]: "Sender and recipient email addresses cannot be the same.",
  [-10]: "Invalid fee configuration.",
  [-11]: "Commission percentage is out of range.",
  [-12]: "Partner reference exceeds 30 characters.",
  [-99]: "Transpact service is temporarily unavailable. Please try again later.",
};

export function transpactErrorMessage(code: number): string {
  return (
    ERROR_MAP[code] ??
    `Transpact returned an unexpected error (code ${code}). Please contact support.`
  );
}
 
 
 
 
 
 
 
 
 
 
