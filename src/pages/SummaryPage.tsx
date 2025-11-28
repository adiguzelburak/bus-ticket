/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CheckCircle2, Download, Loader2, Printer } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { createTicketSale, getAgencies } from "../services/api";
import type { Passenger, Trip } from "../types";

interface FormData {
  passengers: Passenger[];
  contact: {
    email: string;
    phone: string;
  };
}

interface LocationState {
  trip: Trip;
  selectedSeats: number[];
  totalAmount: number;
  formData: FormData;
  pnr?: string;
}

function SummaryPage() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get("success") === "true";
  });
  const [pnr, setPnr] = useState(state?.pnr || "");

  const { data: agencies } = useQuery({
    queryKey: ["agencies"],
    queryFn: getAgencies,
  });

  const getAgencyName = (id: string) => {
    return agencies?.find((a) => a.id === id)?.name || id;
  };

  const handlePayment = async () => {
    if (!state) return;
    setIsLoading(true);

    try {
      const { trip, selectedSeats, formData } = state;
      const response = await createTicketSale({
        tripId: trip.id,
        seats: selectedSeats,
        contact: formData.contact,
        passengers: formData.passengers,
      });

      if (response.ok) {
        setPnr(response.pnr);
        setIsSuccess(true);
        navigate("/summary?success=true", {
          state: { ...state, pnr: response.pnr },
        });
      } else {
        alert(`${t("summary.paymentError")}: ${response.message}`);
        navigate("/summary?success=false", { state });
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert(t("summary.paymentFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!state || !pnr) return;

    const { trip, totalAmount, formData } = state;
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text(t("summary.ticketDetails"), 14, 22);

    doc.setFontSize(10);
    doc.text(`PNR: ${pnr}`, 14, 32);
    doc.text(
      `${t("summary.creationDate")}: ${format(new Date(), "dd.MM.yyyy HH:mm")}`,
      14,
      38
    );

    doc.setFontSize(12);
    doc.text(t("summary.tripInfo"), 14, 50);

    const tripData = [
      [t("search.company"), trip.company],
      [t("search.from").toUpperCase(), getAgencyName(trip.from)],
      [t("search.to").toUpperCase(), getAgencyName(trip.to)],
      [
        t("common.date").toUpperCase(),
        format(new Date(trip.departure), "dd.MM.yyyy HH:mm"),
      ],
    ];

    autoTable(doc, {
      startY: 55,
      head: [],
      body: tripData,
      theme: "plain",
      styles: { fontSize: 10, cellPadding: 1 },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 40 } },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    doc.text(
      t("summary.passengerList"),
      14,
      (doc as any).lastAutoTable.finalY + 15
    );

    const passengerData = formData.passengers.map((p) => [
      p.seat.toString(),
      `${p.firstName} ${p.lastName}`,
      p.idNo,
      p.gender === "male" ? t("common.male") : t("common.female"),
    ]);

    autoTable(doc, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [
        [
          t("seatSelection.seat"),
          t("passenger.fullName"),
          t("passenger.idNo"),
          t("common.gender"),
        ],
      ],
      body: passengerData,
      theme: "striped",
      headStyles: { fillColor: [41, 128, 185] },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.text(
      `${t("common.totalAmount")}: ${totalAmount} ${t("common.currency")}`,
      14,
      finalY
    );

    doc.save(`bilet-${pnr}.pdf`);
  };

  if (!state) {
    return (
      <div className="container mx-auto p-8 text-center">
        <p className="text-red-500 mb-4">{t("passenger.missingInfo")}</p>
        <Button onClick={() => navigate("/")}>
          {t("passenger.returnToStart")}
        </Button>
      </div>
    );
  }

  const { trip, selectedSeats, totalAmount, formData } = state;

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl text-center">
        <div className="mb-8 flex justify-center">
          <CheckCircle2 className="w-24 h-24 text-green-500" />
        </div>

        <h1 className="text-3xl font-bold text-green-600 mb-4">
          {t("summary.paymentSuccess")}
        </h1>
        <p className="text-gray-600 mb-8">{t("summary.successMessage")}</p>

        <Card className="mb-8 text-left">
          <CardHeader className="border-b ">
            <div className="flex justify-between items-center">
              <CardTitle>{t("summary.ticketDetails")}</CardTitle>
              <span className="font-mono text-sm text-zinc-500 dark:text-zinc-400">
                PNR: {pnr}
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                  {t("summary.tripInfo")}
                </h3>
                <p className="text-sm text-gray-600 dark:text-zinc-400">
                  <span className="font-medium">{t("search.company")}:</span>{" "}
                  {trip.company}
                </p>
                <p className="text-sm text-gray-600 dark:text-zinc-400">
                  <span className="font-medium">{t("summary.route")}:</span>{" "}
                  {getAgencyName(trip.from)} - {getAgencyName(trip.to)}
                </p>
                <p className="text-sm text-gray-600 dark:text-zinc-400">
                  <span className="font-medium">{t("common.date")}:</span>{" "}
                  {format(new Date(trip.departure), "dd.MM.yyyy HH:mm")}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                  {t("passenger.contactInfo")}
                </h3>
                <p className="text-sm text-gray-600 dark:text-zinc-400">
                  {formData.contact.email}
                </p>
                <p className="text-sm text-gray-600 dark:text-zinc-400">
                  {formData.contact.phone}
                </p>
              </div>
            </div>

            <h3 className="font-semibold text-gray-900 mb-3">
              {t("summary.passengerList")}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 uppercase">
                  <tr>
                    <th className="px-4 py-2 rounded-l">
                      {t("seatSelection.seat")}
                    </th>
                    <th className="px-4 py-2">{t("passenger.fullName")}</th>
                    <th className="px-4 py-2">{t("passenger.idNo")}</th>
                    <th className="px-4 py-2 rounded-r">
                      {t("common.gender")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {formData.passengers.map((passenger, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="px-4 py-3 font-medium">
                        {passenger.seat}
                      </td>
                      <td className="px-4 py-3">
                        {passenger.firstName} {passenger.lastName}
                      </td>
                      <td className="px-4 py-3">{passenger.idNo}</td>
                      <td className="px-4 py-3">
                        {passenger.gender === "male"
                          ? t("common.male")
                          : t("common.female")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end items-center border-t pt-4">
              <span className="text-gray-600 mr-4">
                {t("summary.totalPaid")}:
              </span>
              <span className="text-2xl font-bold text-blue-600">
                {new Intl.NumberFormat(i18n.language, {
                  style: "currency",
                  currency: "TRY",
                }).format(totalAmount)}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            {t("summary.print")}
          </Button>
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            {t("summary.downloadPdf")}
          </Button>
          <Button onClick={() => navigate("/")}>
            {t("summary.newSearch")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">
        {t("summary.tripAndPassengerInfo")}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("summary.tripAndPassengerInfo")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-lg border">
                  <h3 className="font-semibold mb-2">{trip.company}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div>
                      <span className="block font-medium text-zinc-900 dark:text-zinc-100">
                        {t("search.from")}
                      </span>
                      {getAgencyName(trip.from)}
                    </div>
                    <div>
                      <span className="block font-medium text-zinc-900 dark:text-zinc-100">
                        {t("search.to")}
                      </span>
                      {getAgencyName(trip.to)}
                    </div>
                    <div>
                      <span className="block font-medium text-zinc-900 dark:text-zinc-100">
                        {t("common.date")}
                      </span>
                      {format(new Date(trip.departure), "dd.MM.yyyy HH:mm")}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">
                    {t("passenger.passengers")}
                  </h3>
                  <div className="space-y-3">
                    {formData.passengers.map((p, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 border rounded hover:bg-zinc-200 dark:hover:bg-zinc-800"
                      >
                        <div className="flex items-center gap-3">
                          <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-bold px-2 py-1 rounded">
                            {t("seatSelection.seat")} {p.seat}
                          </span>
                          <div>
                            <p className="font-medium">
                              {p.firstName} {p.lastName}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              {t("passenger.idNo")}: {p.idNo}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm text-zinc-600 dark:text-zinc-400">
                          {p.gender === "male"
                            ? t("common.male")
                            : t("common.female")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">
                    {t("passenger.contactInfo")}
                  </h3>
                  <div className="text-sm text-gray-600 grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-zinc-900 dark:text-zinc-100">
                        {t("passenger.email")}:
                      </span>
                      {formData.contact.email}
                    </div>
                    <div>
                      <span className="block text-zinc-900 dark:text-zinc-100">
                        {t("passenger.phone")}:
                      </span>
                      {formData.contact.phone}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-zinc-100 dark:bg-zinc-900 p-6 rounded-lg shadow-sm border sticky top-4">
            <h3 className="text-lg font-semibold mb-4">
              {t("summary.paymentSummary")}
            </h3>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {t("summary.ticketPrice")} ({selectedSeats.length} x{" "}
                  {trip.price} {t("common.currency")})
                </span>
                <span className="font-medium">
                  {new Intl.NumberFormat(i18n.language, {
                    style: "currency",
                    currency: "TRY",
                  }).format(totalAmount)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t("summary.serviceFee")}</span>
                <span className="font-medium">
                  {new Intl.NumberFormat(i18n.language, {
                    style: "currency",
                    currency: "TRY",
                  }).format(0)}
                </span>
              </div>
              <div className="border-t pt-3 mt-3 flex justify-between items-center">
                <span className="font-bold text-gray-900">
                  {t("common.totalAmount")}
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  {new Intl.NumberFormat(i18n.language, {
                    style: "currency",
                    currency: "TRY",
                  }).format(totalAmount)}
                </span>
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handlePayment}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("summary.processingPayment")}
                </>
              ) : (
                t("summary.completePayment")
              )}
            </Button>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-4 text-center">
              {t("summary.securePayment")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SummaryPage;
