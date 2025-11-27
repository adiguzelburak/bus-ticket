import { useLocation, useNavigate } from "react-router-dom";
import StepperTitleStatus from "../stepper/title-status";
import Navbar from "./navbar";

function Layout({ children }: { children: React.ReactNode }) {
  const pages = {
    "/": 1,
    "/seat-selection": 2,
    "/passenger-form": 3,
    "/summary": 4,
  };
  const navigate = useNavigate();
  const location = useLocation();
  const currentPageName = location.pathname.split("/")[1];
  const currentPage = pages[("/" + currentPageName) as keyof typeof pages];
  return (
    <div className="flex flex-col container mx-auto px-4 py-8 max-w-6xl gap-8">
      <Navbar />
      <StepperTitleStatus
        onStepChange={(e) => {
          const page = Object.keys(pages)[e - 1] as string;
          navigate(page);
        }}
        children={children}
        currentPage={currentPage}
      />
    </div>
  );
}

export default Layout;
