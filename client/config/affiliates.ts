// PaintBookCo Affiliate Configuration
// Update merchant IDs when new Awin programmes are approved.

export const AFFILIATE_CONFIG = {
  amazon: {
    tag: "paintbookco-21",
    baseUrl: "https://www.amazon.co.uk/s",
    status: "active",
  },
  awin: {
    publisherId: "2909131",
    merchants: {
      duluxDecoratorCentre: {
        id: "16263",
        name: "Dulux Decorator Centre",
        baseUrl: "https://www.duluxdecoratorcentre.co.uk",
        status: "pending_approval",
        colour: "#007DC3",
      },
      farrowAndBall: {
        id: "20199",
        name: "Farrow & Ball",
        baseUrl: "https://www.farrow-ball.com",
        status: "pending_approval",
        colour: "#2C2C2C",
      },
      wickes: {
        id: "1563",
        name: "Wickes",
        baseUrl: "https://www.wickes.co.uk",
        status: "pending_approval",
        colour: "#E31837",
      },
      wilko: {
        id: "", // TODO: add merchant ID from Awin dashboard once approved
        name: "Wilko",
        baseUrl: "https://www.wilko.com",
        status: "pending_approval",
        colour: "#E31837",
      },
    },
  },
  impact: {
    publisherId: "", // TODO: add after Impact registration
    merchants: {
      bq: {
        id: "", // TODO: add after B&Q Impact approval
        name: "B&Q",
        baseUrl: "https://www.diy.com",
        status: "pending_registration",
        colour: "#006B3F",
      },
    },
  },
} as const;

export function makeAwinLink(merchantId: string, targetUrl: string): string {
  return `https://www.awin1.com/cread.php?awinmid=${merchantId}&awinaffid=${AFFILIATE_CONFIG.awin.publisherId}&ued=${encodeURIComponent(targetUrl)}`;
}

export function makeAmazonLink(searchTerm: string): string {
  return `${AFFILIATE_CONFIG.amazon.baseUrl}?k=${encodeURIComponent(searchTerm)}&tag=${AFFILIATE_CONFIG.amazon.tag}`;
}

/** B&Q fallback to Amazon until Impact registration is complete */
export function makeBqLink(searchTerm: string): string {
  return makeAmazonLink(searchTerm + " paint");
}
