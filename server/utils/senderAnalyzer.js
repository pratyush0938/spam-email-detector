const trustedDomains = [
  "gmail.com",
  "outlook.com",
  "hotmail.com",
  "yahoo.com",
  "icloud.com",
  "proton.me",
  "protonmail.com",
  "zoho.com",
  "company.com",
  "amazon.com",
  "microsoft.com",
  "google.com",
  "apple.com",
  "flipkart.com",
];

const suspiciousTlds = [
  ".xyz",
  ".top",
  ".click",
  ".shop",
  ".buzz",
  ".loan",
  ".work",
  ".support",
  ".live",
  ".cam",
  ".monster",
  ".info",
  ".gq",
  ".tk",
  ".ml",
];

const disposableDomains = [
  "mailinator.com",
  "10minutemail.com",
  "guerrillamail.com",
  "tempmail.com",
  "yopmail.com",
  "trashmail.com",
  "dispostable.com",
  "temp-mail.org",
];

const suspiciousKeywords = [
  "verify",
  "support",
  "secure",
  "bank",
  "alert",
  "update",
  "billing",
  "payment",
  "reward",
  "claim",
  "bonus",
  "wallet",
  "payroll",
  "reactivation",
  "recovery",
  "security",
  "invoice",
  "refund",
  "crypto",
  "winner",
  "lottery",
];

export const analyzeSenderEmail = (senderEmail = "") => {
  const email = senderEmail.trim().toLowerCase();

  let riskScore = 0;
  const flags = [];

  if (!email) {
    return {
      sender_analysis: "unknown",
      sender_risk_score: 0,
      sender_flags: [],
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return {
      sender_analysis: "highly suspicious",
      sender_risk_score: 100,
      sender_flags: ["Invalid email format"],
    };
  }

  const parts = email.split("@");

  if (parts.length !== 2) {
    return {
      sender_analysis: "highly suspicious",
      sender_risk_score: 100,
      sender_flags: ["Malformed email structure"],
    };
  }

  const [localPart, domain] = parts;

  if (!localPart || !domain) {
    return {
      sender_analysis: "highly suspicious",
      sender_risk_score: 100,
      sender_flags: ["Missing local part or domain"],
    };
  }

  // Trusted domain
  if (trustedDomains.includes(domain)) {
    flags.push("Trusted email domain");
    riskScore -= 25;
  }

  // Disposable domain
  if (disposableDomains.includes(domain)) {
    flags.push("Disposable/temporary email domain");
    riskScore += 35;
  }

  // Suspicious TLD
  const hasSuspiciousTld = suspiciousTlds.some((tld) => domain.endsWith(tld));
  if (hasSuspiciousTld) {
    flags.push("Suspicious top-level domain");
    riskScore += 25;
  }

  // Suspicious keywords in local part or domain
  const containsKeyword = suspiciousKeywords.some(
    (keyword) => localPart.includes(keyword) || domain.includes(keyword),
  );
  if (containsKeyword) {
    flags.push("Contains suspicious email keywords");
    riskScore += 15;
  }

  // Too many digits
  const manyNumbers = (localPart.match(/\d/g) || []).length >= 4;
  if (manyNumbers) {
    flags.push("Too many digits in sender name");
    riskScore += 12;
  }

  // Random pattern
  const randomPattern = /[a-z]+\d+[a-z]+\d+|\d+[a-z]+\d+/i.test(localPart);
  if (randomPattern) {
    flags.push("Random-looking sender name pattern");
    riskScore += 12;
  }

  // Too many hyphens/segments
  const hyphenCount = (localPart.match(/-/g) || []).length;
  if (hyphenCount >= 2) {
    flags.push("Too many separators in sender name");
    riskScore += 8;
  }

  // Very short local part
  if (localPart.length < 3) {
    flags.push("Very short sender name");
    riskScore += 8;
  }

  // Long domain name
  const domainName = domain.split(".")[0];
  if (domainName.length > 20) {
    flags.push("Unusually long domain name");
    riskScore += 10;
  }

  // Mixed suspicious pattern
  if (
    !trustedDomains.includes(domain) &&
    (containsKeyword || hasSuspiciousTld) &&
    manyNumbers
  ) {
    flags.push("Highly suspicious sender composition");
    riskScore += 15;
  }

  if (riskScore < 0) riskScore = 0;
  if (riskScore > 100) riskScore = 100;

  let senderAnalysis = "safe";

  if (riskScore >= 60) {
    senderAnalysis = "highly suspicious";
  } else if (riskScore >= 30) {
    senderAnalysis = "suspicious";
  } else {
    senderAnalysis = "safe";
  }

  return {
    sender_analysis: senderAnalysis,
    sender_risk_score: riskScore,
    sender_flags: flags,
  };
};
