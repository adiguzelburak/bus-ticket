import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { getAgencies, getSchedules } from "../services/api";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import type { Trip } from "../types";
import { ArrowRight, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "../lib/utils";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function SearchPage() {
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState<Trip[] | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [sortBy, setSortBy] = useState<string>("time-asc");
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);

  const { data: agencies, isLoading: isLoadingAgencies } = useQuery({
    queryKey: ["agencies"],
    queryFn: getAgencies,
  });

  const uniqueCompanies = useMemo(() => {
    if (!searchResults) return [];
    const companies = new Set(searchResults.map((trip) => trip.company));
    return Array.from(companies);
  }, [searchResults]);

  const filteredAndSortedResults = useMemo(() => {
    if (!searchResults) return [];

    let results = [...searchResults];

    if (selectedCompanies.length > 0) {
      results = results.filter((trip) =>
        selectedCompanies.includes(trip.company)
      );
    }

    results.sort((a, b) => {
      if (sortBy === "price-asc") {
        return a.price - b.price;
      } else if (sortBy === "price-desc") {
        return b.price - a.price;
      } else if (sortBy === "time-asc") {
        return (
          new Date(a.departure).getTime() - new Date(b.departure).getTime()
        );
      } else if (sortBy === "time-desc") {
        return (
          new Date(b.departure).getTime() - new Date(a.departure).getTime()
        );
      }
      return 0;
    });

    return results;
  }, [searchResults, sortBy, selectedCompanies]);

  const handleCompanyToggle = (company: string) => {
    setSelectedCompanies((prev) =>
      prev.includes(company)
        ? prev.filter((c) => c !== company)
        : [...prev, company]
    );
  };

  const formik = useFormik({
    initialValues: {
      from: "",
      to: "",
      date: undefined as Date | undefined,
    },
    validationSchema: Yup.object({
      from: Yup.string().required("Kalkış noktası seçiniz"),
      to: Yup.string()
        .required("Varış noktası seçiniz")
        .notOneOf([Yup.ref("from")], "Kalkış ve varış noktası aynı olamaz"),
      date: Yup.date()
        .required("Tarih seçiniz")
        .min(
          new Date(new Date().setHours(0, 0, 0, 0)),
          "Geçmiş bir tarih seçemezsiniz"
        ),
    }),
    onSubmit: async (values) => {
      if (!values.date) return;

      setHasSearched(true);
      setSearchResults(null);
      try {
        const formattedDate = format(values.date, "yyyy-MM-dd");
        const results = await getSchedules(
          values.from,
          values.to,
          formattedDate
        );
        setSearchResults(results);
      } catch (error) {
        console.error("Search failed", error);
      }
    },
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Otobüs Bileti Ara</h1>

      <div className="p-6 rounded-lg shadow-md mb-8">
        <form
          onSubmit={formik.handleSubmit}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start"
        >
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kalkış
            </label>
            <Select
              onValueChange={(value) => formik.setFieldValue("from", value)}
              value={formik.values.from}
              disabled={isLoadingAgencies}
            >
              <SelectTrigger
                className={cn(
                  "w-full",
                  formik.touched.from && formik.errors.from
                    ? "border-red-500"
                    : "border-gray-300"
                )}
              >
                <SelectValue placeholder="Seçiniz" />
              </SelectTrigger>
              <SelectContent>
                {agencies?.map((agency) => (
                  <SelectItem key={agency.id} value={agency.id}>
                    {agency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formik.touched.from && formik.errors.from && (
              <p className="text-red-500 text-xs mt-1">{formik.errors.from}</p>
            )}
          </div>

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Varış
            </label>
            <Select
              onValueChange={(value) => formik.setFieldValue("to", value)}
              value={formik.values.to}
              disabled={isLoadingAgencies}
            >
              <SelectTrigger
                className={cn(
                  "w-full",
                  formik.touched.to && formik.errors.to
                    ? "border-red-500"
                    : "border-gray-300"
                )}
              >
                <SelectValue placeholder="Seçiniz" />
              </SelectTrigger>
              <SelectContent>
                {agencies?.map((agency) => (
                  <SelectItem key={agency.id} value={agency.id}>
                    {agency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formik.touched.to && formik.errors.to && (
              <p className="text-red-500 text-xs mt-1">{formik.errors.to}</p>
            )}
          </div>

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tarih
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formik.values.date && "text-muted-foreground",
                    formik.touched.date && formik.errors.date
                      ? "border-red-500"
                      : "border-gray-300"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formik.values.date ? (
                    format(formik.values.date, "PPP")
                  ) : (
                    <span>Tarih seçiniz</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formik.values.date}
                  onSelect={(date) => formik.setFieldValue("date", date)}
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {formik.touched.date && formik.errors.date && (
              <p className="text-red-500 text-xs mt-1">
                {String(formik.errors.date)}
              </p>
            )}
          </div>

          <div className="w-full md:pt-6">
            <Button
              type="submit"
              className="w-full"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? "Aranıyor..." : "Bilet Ara"}
            </Button>
          </div>
        </form>
      </div>

      {hasSearched && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <h2 className="text-xl font-semibold">Seferler</h2>

            {searchResults && searchResults.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Firma:
                  </span>
                  {uniqueCompanies.map((company) => (
                    <label
                      key={company}
                      className="flex items-center gap-1 text-sm cursor-pointer bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCompanies.includes(company)}
                        onChange={() => handleCompanyToggle(company)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      {company}
                    </label>
                  ))}
                </div>

                <div className="w-full sm:w-48">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sıralama" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price-asc">Fiyat (Artan)</SelectItem>
                      <SelectItem value="price-desc">Fiyat (Azalan)</SelectItem>
                      <SelectItem value="time-asc">Saat (Erken)</SelectItem>
                      <SelectItem value="time-desc">Saat (Geç)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {searchResults === null ? (
            <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
          ) : filteredAndSortedResults.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500">
                {searchResults.length > 0
                  ? "Seçilen filtrelere uygun sefer bulunamadı."
                  : "Aradığınız kriterlere uygun sefer bulunamadı."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedResults.map((trip) => (
                <div
                  key={trip.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-lg">{trip.company}</span>
                      <Badge variant="secondary" className="text-xs">
                        {trip.availableSeats} Koltuk
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {format(new Date(trip.departure), "HH:mm")}
                        </span>
                        <span className="text-xs">
                          {agencies?.find((a) => a.id === trip.from)?.name ||
                            trip.from}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {format(new Date(trip.arrival), "HH:mm")}
                        </span>
                        <span className="text-xs">
                          {agencies?.find((a) => a.id === trip.to)?.name ||
                            trip.to}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end gap-2">
                    <span className="text-xl font-bold text-blue-600">
                      {trip.price} TL
                    </span>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/seat-selection/${trip.id}`)}
                    >
                      Seç
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchPage;
