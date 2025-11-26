import { useNavigate } from "react-router-dom";
import StepperTitleStatus from "../stepper/title-status";

function Layout({ children }: { children: React.ReactNode }) {
  const pages = {
    "/": 1,
    "/seat-selection": 2,
    "/summary": 3,
    "/preview": 4,
  };
  const navigate = useNavigate();
  return (
    <div>
      <StepperTitleStatus
        onStepChange={(e) => {
          const page = Object.keys(pages)[e - 1] as string;
          navigate(page);
        }}
        children={children}
      />
    </div>
  );
}

export default Layout;
