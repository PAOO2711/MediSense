"use client";

import { ApiReferenceReact } from "@scalar/api-reference-react";

export default function ApiDocsPage() {
  return (
    <ApiReferenceReact
      configuration={{
        _integration: "nextjs",
        url: "/openapi.json",
      }}
    />
  );
}
