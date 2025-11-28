import { Badge } from "@/components/ui/badge";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper";
import {
  Check,
  CircleDot,
  CreditCard,
  Eye,
  LoaderCircleIcon,
  SearchIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

const steps = [
  { title: "search", icon: SearchIcon },
  { title: "seatSelection", icon: CircleDot },
  { title: "passengerInfo", icon: Eye },
  { title: "payment", icon: CreditCard },
];

export default function StepperTitleStatus({
  onStepChange,
  children,
  currentPage,
}: {
  onStepChange: (step: number) => void;
  children: React.ReactNode;
  currentPage: number;
}) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(currentPage);
  const searchParams = useSearchParams();
  const success = searchParams[0]?.get("success") || "false";

  const derivedStep = success === "true" ? 5 : currentPage;

  useEffect(() => {
    setCurrentStep(derivedStep);
  }, [derivedStep]);

  return (
    <Stepper
      value={currentStep}
      onValueChange={(e) => {
        setCurrentStep(e);
        onStepChange(e);
      }}
      indicators={{
        completed: <Check className="size-4" />,
        loading: <LoaderCircleIcon className="size-4 animate-spin" />,
      }}
      className="space-y-8"
    >
      <StepperNav className="gap-3 mb-15">
        {steps.map((step, index) => {
          return (
            <StepperItem
              key={index}
              step={index + 1}
              className="relative flex-1 items-start"
            >
              <StepperTrigger
                className="flex flex-col items-start justify-center gap-2.5 grow"
                asChild
              >
                <StepperIndicator className="size-8 border-2 data-[state=completed]:text-white data-[state=completed]:bg-green-500 data-[state=inactive]:bg-transparent data-[state=inactive]:border-border data-[state=inactive]:text-muted-foreground">
                  <step.icon className="size-4" />
                </StepperIndicator>
                <div className="flex flex-col items-start gap-1">
                  <div className="text-[10px] font-semibold uppercase text-muted-foreground">
                    {t("stepper.step")} {index + 1}
                  </div>
                  <StepperTitle className="text-start text-base font-semibold group-data-[state=inactive]/step:text-muted-foreground">
                    {t(`stepper.${step.title}`)}
                  </StepperTitle>
                  <div>
                    <Badge
                      variant="primary"
                      size="sm"
                      appearance="light"
                      className="hidden group-data-[state=active]/step:inline-flex"
                    >
                      {t("stepper.inProgress")}
                    </Badge>

                    <Badge
                      variant="success"
                      size="sm"
                      appearance="light"
                      className="hidden group-data-[state=completed]/step:inline-flex"
                    >
                      {t("stepper.completed")}
                    </Badge>

                    <Badge
                      variant="secondary"
                      size="sm"
                      className="hidden group-data-[state=inactive]/step:inline-flex text-muted-foreground"
                    >
                      {t("stepper.waiting")}
                    </Badge>
                  </div>
                </div>
              </StepperTrigger>

              {steps.length > index + 1 && (
                <StepperSeparator className="absolute top-4 inset-x-0 start-9 m-0 group-data-[orientation=horizontal]/stepper-nav:w-[calc(100%-2rem)] group-data-[orientation=horizontal]/stepper-nav:flex-none  group-data-[state=completed]/step:bg-green-500" />
              )}
            </StepperItem>
          );
        })}
      </StepperNav>

      <StepperPanel className="text-sm">{children}</StepperPanel>
    </Stepper>
  );
}
