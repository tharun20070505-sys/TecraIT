import { siteSettings } from "@/data/site";

export function DepartmentJsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tecra.sriet.ac.in";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": `${siteUrl}/#organization`,
    name: `${siteSettings.departmentName}, ${siteSettings.institutionName}`,
    alternateName: ["TECRA IT", "SRIET IT", "TECRA Department of Information Technology"],
    url: siteUrl,
    logo: `${siteUrl}/images/hero/sriet-campus.png`,
    image: `${siteUrl}/images/hero/sriet-campus.png`,
    description: siteSettings.heroDescription,
    parentOrganization: {
      "@type": "CollegeOrUniversity",
      name: siteSettings.institutionName,
      alternateName: siteSettings.institutionShort,
      url: "https://sriet.ac.in",
    },
    department: {
      "@type": "Organization",
      name: siteSettings.departmentName,
      alternateName: "TECRA",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: siteSettings.departmentOffice.address,
      addressLocality: "Coimbatore",
      addressRegion: "Tamil Nadu",
      postalCode: "641110",
      addressCountry: "IN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Department Office",
      email: siteSettings.departmentOffice.email,
      availableLanguage: ["English", "Tamil"],
    },
    sameAs: [
      siteSettings.socialLinks.linkedin,
      siteSettings.socialLinks.twitter,
      siteSettings.socialLinks.instagram,
      siteSettings.socialLinks.youtube,
    ].filter(Boolean),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
