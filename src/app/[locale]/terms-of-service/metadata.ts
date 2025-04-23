import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Terms of Service",
    description:
      "Read our terms of service and understand the rules and guidelines for using our platform.",
  };
}
