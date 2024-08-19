import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import Steps from "@/components/Steps";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <MaxWidthWrapper className="flex flex-col flex-1">
      <Steps />
      <div className="flex-grow">{children}</div>
    </MaxWidthWrapper>
  );
};

export default Layout;
