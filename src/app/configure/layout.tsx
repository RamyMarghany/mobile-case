import MaxWidthWrapper from "@/components/MaxWidthWrapper";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <MaxWidthWrapper className="flex flex-col flex-1">
      <div className="flex-grow">{children}</div>
    </MaxWidthWrapper>
  );
};

export default Layout;
