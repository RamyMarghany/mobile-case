import DesignConfigurator from "@/components/DesignConfigurator";
import { db } from "@/db";
import { notFound } from "next/navigation";

interface PageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

const Page = async ({ searchParams }: PageProps) => {
  // using async to make db call on server
  const { id } = searchParams;
  if (!id || typeof id !== "string") {
    return notFound();
  }

  const configuration = await db.configuration.findUnique({
    where: { id },
  });
  if (!configuration) {
    return notFound();
  }
  const { imageUrl, width, height } = configuration;

  return (
    <DesignConfigurator
      configId={configuration}
      imageUrl={imageUrl}
      imageDimensions={{ width, height }}
    />
  );
};

export default Page;
