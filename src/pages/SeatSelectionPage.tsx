import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getSeatSchema, getTrip, getAgencies } from "../services/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Armchair, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Seat } from "../types";
import { format } from "date-fns";
import { tr as trLocale, enUS as enLocale } from "date-fns/locale";
import { Alert, AlertIcon, AlertTitle } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";

function SeatSelectionPage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedSeatNos, setSelectedSeatNos] = useState<number[]>([]);

  const dateLocale = i18n.language === "tr" ? trLocale : enLocale;

  const { data: trip, isLoading: isLoadingTrip } = useQuery({
    queryKey: ["trip", id],
    queryFn: () => getTrip(id!),
    enabled: !!id,
  });

  const { data: seatSchema, isLoading: isLoadingSchema } = useQuery({
    queryKey: ["seatSchema", id],
    queryFn: () => getSeatSchema(id!),
    enabled: !!id,
  });

  const { data: agencies } = useQuery({
    queryKey: ["agencies"],
    queryFn: getAgencies,
  });

  const getAgencyName = (id: string) => {
    return agencies?.find((a) => a.id === id)?.name || id;
  };

  if (isLoadingTrip || isLoadingSchema) {
    return (
      <div className="container mx-auto p-8 text-center">
        {t("common.loading")}
      </div>
    );
  }

  if (!trip || !seatSchema) {
    return (
      <div className="container mx-auto p-8 text-center">
        <p className="text-red-500 mb-4">{t("seatSelection.tripNotFound")}</p>
        <Button onClick={() => navigate(-1)}>{t("common.back")}</Button>
      </div>
    );
  }

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === "taken") return;

    if (selectedSeatNos.includes(seat.no)) {
      setSelectedSeatNos((prev) => prev.filter((n) => n !== seat.no));
    } else {
      if (selectedSeatNos.length >= 4) {
        toast.custom(
          (tId) => (
            <Alert
              variant="destructive"
              icon="destructive"
              onClose={() => toast.dismiss(tId)}
            >
              <AlertIcon>
                <X />
              </AlertIcon>
              <AlertTitle>{t("seatSelection.maxSeatsError")}</AlertTitle>
            </Alert>
          ),
          {
            duration: 5000,
          }
        );

        return;
      }
      setSelectedSeatNos((prev) => [...prev, seat.no]);
    }
  };

  const getCellContent = (rowIndex: number, colIndex: number) => {
    const currentRow = rowIndex + 1;
    const currentCol = colIndex + 1;

    const cellTypeIndex = rowIndex * seatSchema.layout.cols + colIndex;
    const cellType = seatSchema.layout.cells[cellTypeIndex];

    if (cellType === 2) {
      return (
        <div className="w-10 h-10" key={`aisle-${rowIndex}-${colIndex}`} />
      );
    }

    const seat = seatSchema.seats.find(
      (s) => s.row === currentRow && s.col === currentCol
    );

    if (!seat) {
      return (
        <div className="w-10 h-10" key={`empty-${rowIndex}-${colIndex}`} />
      );
    }

    const isSelected = selectedSeatNos.includes(seat.no);
    const isTaken = seat.status === "taken";

    return (
      <button
        key={`seat-${seat.no}`}
        disabled={isTaken}
        onClick={() => handleSeatClick(seat)}
        className={cn(
          "w-10 h-10 rounded-md flex items-center justify-center transition-colors relative group",
          isTaken
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : isSelected
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-white border border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-500"
        )}
        title={`${t("seatSelection.seat")} ${seat.no}`}
      >
        <Armchair className="w-5 h-5" />
        <span className="absolute -top-2 -right-2 text-[10px] font-bold bg-gray-100 px-1 rounded border">
          {seat.no}
        </span>
      </button>
    );
  };

  const totalAmount = selectedSeatNos.length * seatSchema.unitPrice;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Button
        variant="ghost"
        className="mb-6 pl-0 hover:bg-transparent hover:text-blue-600"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("seatSelection.backToTrips")}
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className=" p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-6 border-b pb-4">
              <div>
                <h2 className="text-xl font-bold">{trip.company}</h2>
                <p className="text-gray-500 text-sm">
                  {format(new Date(trip.departure), "dd MMMM yyyy HH:mm", {
                    locale: dateLocale,
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  {getAgencyName(trip.from)} - {getAgencyName(trip.to)}
                </p>
                <p className="text-sm text-gray-500">
                  {t("seatSelection.busType")}
                </p>
              </div>
            </div>

            <div className="flex justify-center mb-8">
              <div className="inline-block bg-zinc-100 dark:bg-zinc-900 p-8 rounded-xl border border-gray-200">
                <div className="mb-8 flex justify-start px-2">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                    <User className="w-5 h-5" />
                  </div>
                </div>

                <div
                  className="grid gap-3"
                  style={{
                    gridTemplateColumns: `repeat(${seatSchema.layout.cols}, minmax(0, 1fr))`,
                  }}
                >
                  {Array.from({ length: seatSchema.layout.rows }).map(
                    (_, rowIndex) =>
                      Array.from({ length: seatSchema.layout.cols }).map(
                        (_, colIndex) => getCellContent(rowIndex, colIndex)
                      )
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded border border-gray-300 bg-white dark:bg-zinc-900"></div>
                <span>{t("seatSelection.empty")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-blue-600"></div>
                <span>{t("seatSelection.selected")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-gray-200"></div>
                <span>{t("seatSelection.taken")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-gray-50 border border-gray-200"></div>
                <span>{t("seatSelection.aisle")}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-zinc-100 dark:bg-zinc-900 p-6 rounded-lg shadow-sm border sticky top-4">
            <h3 className="text-lg font-semibold mb-4">
              {t("seatSelection.selectedSeats")}
            </h3>

            {selectedSeatNos.length === 0 ? (
              <p className="text-gray-500 text-sm mb-6">
                {t("seatSelection.noSeatSelected")}
              </p>
            ) : (
              <div className="space-y-3 mb-6">
                {selectedSeatNos.map((no) => (
                  <div
                    key={no}
                    className="flex items-center justify-between p-3 bg-zinc-200 dark:bg-zinc-800 rounded border"
                  >
                    <span className="font-medium">
                      {t("seatSelection.seat")} {no}
                    </span>
                    <span className="font-bold">
                      {seatSchema.unitPrice} {t("common.currency")}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t pt-4 mt-auto">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">{t("common.totalAmount")}</span>
                <span className="text-2xl font-bold text-blue-600">
                  {totalAmount} {t("common.currency")}
                </span>
              </div>

              <Button
                className="w-full"
                size="lg"
                disabled={selectedSeatNos.length === 0}
                onClick={() =>
                  navigate("/passenger-form", {
                    state: {
                      trip,
                      selectedSeats: selectedSeatNos,
                      totalAmount,
                    },
                  })
                }
              >
                {t("seatSelection.confirmAndContinue")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SeatSelectionPage;
