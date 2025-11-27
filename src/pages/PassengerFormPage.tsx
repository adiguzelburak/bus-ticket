/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useFormik } from "formik";
import { useLocation, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import type { Passenger, Trip } from "../types";
import { getAgencies } from "../services/api";
import { useQuery } from "@tanstack/react-query";

interface LocationState {
  trip: Trip;
  selectedSeats: number[];
  totalAmount: number;
}

const passengerSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, "En az 2 karakter olmalı")
    .required("Ad zorunludur"),
  lastName: Yup.string()
    .min(2, "En az 2 karakter olmalı")
    .required("Soyad zorunludur"),
  idNo: Yup.string()
    .length(11, "TCKN 11 haneli olmalıdır")
    .matches(/^[0-9]+$/, "Sadece rakam içermelidir")
    .required("TCKN zorunludur"),
  gender: Yup.string()
    .oneOf(["male", "female"], "Cinsiyet seçiniz")
    .required("Cinsiyet zorunludur"),
});

const validationSchema = Yup.object().shape({
  passengers: Yup.array().of(passengerSchema),
  contact: Yup.object().shape({
    email: Yup.string()
      .email("Geçerli bir e-posta adresi giriniz")
      .required("E-posta zorunludur"),
    phone: Yup.string()
      .matches(
        /^[0-9]{10,11}$/,
        "Geçerli bir telefon numarası giriniz (Başında 0 olmadan 10 hane veya 11 hane)"
      )
      .required("Telefon zorunludur"),
  }),
  agreements: Yup.object().shape({
    kvkk: Yup.boolean()
      .oneOf([true], "KVKK metnini onaylamanız gerekmektedir")
      .required("Zorunlu"),
    terms: Yup.boolean()
      .oneOf([true], "Satış sözleşmesini onaylamanız gerekmektedir")
      .required("Zorunlu"),
  }),
});

interface FormValues {
  passengers: Passenger[];
  contact: {
    email: string;
    phone: string;
  };
  agreements: {
    kvkk: boolean;
    terms: boolean;
  };
}

function PassengerFormPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;

  const { trip, selectedSeats, totalAmount } = state as LocationState;

  const { data: agencies } = useQuery({
    queryKey: ["agencies"],
    queryFn: getAgencies,
  });

  const getAgencyName = (id: string) => {
    return agencies?.find((a) => a.id === id)?.name || id;
  };

  const formik = useFormik<FormValues>({
    initialValues: {
      passengers: selectedSeats.map((seat: number) => ({
        seat,
        firstName: "",
        lastName: "",
        idNo: "",
        gender: "male",
      })),
      contact: {
        email: "",
        phone: "",
      },
      agreements: {
        kvkk: false,
        terms: false,
      },
    },
    validationSchema,
    onSubmit: (values) => {
      navigate("/summary", {
        state: {
          trip,
          selectedSeats,
          totalAmount,
          formData: values,
        },
      });
    },
  });

  const passengerErrors = formik.errors.passengers as any;

  if (!state) {
    return (
      <div className="container mx-auto p-8 text-center">
        <p className="text-red-500 mb-4">
          İşlem bilgileri bulunamadı. Lütfen sefer seçiminden başlayınız.
        </p>
        <Button onClick={() => navigate("/")}>Başa Dön</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Yolcu ve İletişim Bilgileri</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={formik.handleSubmit}>
            <div className="space-y-6 mb-8">
              {formik.values.passengers.map(
                (passenger: Passenger, index: number) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-medium flex justify-between items-center">
                        <span>{index + 1}. Yolcu</span>
                        <span className="text-sm font-normal bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Koltuk: {passenger.seat}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`passengers[${index}].firstName`}>
                          Ad
                        </Label>
                        <Input
                          id={`passengers[${index}].firstName`}
                          {...formik.getFieldProps(
                            `passengers[${index}].firstName`
                          )}
                          className={cn(
                            formik.touched.passengers?.[index]?.firstName &&
                              passengerErrors?.[index]?.firstName &&
                              "border-red-500"
                          )}
                        />
                        {formik.touched.passengers?.[index]?.firstName &&
                          passengerErrors?.[index]?.firstName && (
                            <p className="text-red-500 text-xs">
                              {passengerErrors[index].firstName}
                            </p>
                          )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`passengers[${index}].lastName`}>
                          Soyad
                        </Label>
                        <Input
                          id={`passengers[${index}].lastName`}
                          {...formik.getFieldProps(
                            `passengers[${index}].lastName`
                          )}
                          className={cn(
                            formik.touched.passengers?.[index]?.lastName &&
                              passengerErrors?.[index]?.lastName &&
                              "border-red-500"
                          )}
                        />
                        {formik.touched.passengers?.[index]?.lastName &&
                          passengerErrors?.[index]?.lastName && (
                            <p className="text-red-500 text-xs">
                              {passengerErrors[index].lastName}
                            </p>
                          )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`passengers[${index}].idNo`}>
                          TCKN / Pasaport
                        </Label>
                        <Input
                          id={`passengers[${index}].idNo`}
                          {...formik.getFieldProps(`passengers[${index}].idNo`)}
                          className={cn(
                            formik.touched.passengers?.[index]?.idNo &&
                              passengerErrors?.[index]?.idNo &&
                              "border-red-500"
                          )}
                          maxLength={11}
                        />
                        {formik.touched.passengers?.[index]?.idNo &&
                          passengerErrors?.[index]?.idNo && (
                            <p className="text-red-500 text-xs">
                              {passengerErrors[index].idNo}
                            </p>
                          )}
                      </div>

                      <div className="space-y-2">
                        <Label>Cinsiyet</Label>
                        <RadioGroup
                          onValueChange={(val) =>
                            formik.setFieldValue(
                              `passengers[${index}].gender`,
                              val
                            )
                          }
                          defaultValue={passenger.gender}
                          className="flex gap-4 pt-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="male" id={`male-${index}`} />
                            <Label htmlFor={`male-${index}`}>Erkek</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="female"
                              id={`female-${index}`}
                            />
                            <Label htmlFor={`female-${index}`}>Kadın</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </CardContent>
                  </Card>
                )
              )}
            </div>

            <Card className="mb-8">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium">
                  İletişim Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact.email">E-posta</Label>
                  <Input
                    id="contact.email"
                    type="email"
                    {...formik.getFieldProps("contact.email")}
                    className={cn(
                      formik.touched.contact?.email &&
                        formik.errors.contact?.email &&
                        "border-red-500"
                    )}
                  />
                  {formik.touched.contact?.email &&
                    formik.errors.contact?.email && (
                      <p className="text-red-500 text-xs">
                        {formik.errors.contact.email}
                      </p>
                    )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact.phone">Telefon</Label>
                  <Input
                    id="contact.phone"
                    type="tel"
                    placeholder="5551234567"
                    {...formik.getFieldProps("contact.phone")}
                    className={cn(
                      formik.touched.contact?.phone &&
                        formik.errors.contact?.phone &&
                        "border-red-500"
                    )}
                  />
                  {formik.touched.contact?.phone &&
                    formik.errors.contact?.phone && (
                      <p className="text-red-500 text-xs">
                        {formik.errors.contact.phone}
                      </p>
                    )}
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="kvkk"
                    checked={formik.values.agreements.kvkk}
                    onCheckedChange={(checked) =>
                      formik.setFieldValue("agreements.kvkk", checked)
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="kvkk"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      KVKK Aydınlatma Metni'ni okudum, onaylıyorum.
                    </Label>
                    {formik.touched.agreements?.kvkk &&
                      formik.errors.agreements?.kvkk && (
                        <p className="text-red-500 text-xs">
                          {formik.errors.agreements.kvkk}
                        </p>
                      )}
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formik.values.agreements.terms}
                    onCheckedChange={(checked) =>
                      formik.setFieldValue("agreements.terms", checked)
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Ön Bilgilendirme Formu ve Mesafeli Satış Sözleşmesi'ni
                      okudum, onaylıyorum.
                    </Label>
                    {formik.touched.agreements?.terms &&
                      formik.errors.agreements?.terms && (
                        <p className="text-red-500 text-xs">
                          {formik.errors.agreements.terms}
                        </p>
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full" size="lg">
              Ödemeye Geç ({totalAmount} TL)
            </Button>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border sticky top-4">
            <h3 className="text-lg font-semibold mb-4">Sefer Özeti</h3>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Firma</span>
                <span className="font-medium">{trip.company}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Kalkış</span>
                <span className="font-medium">{getAgencyName(trip.from)}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Varış</span>
                <span className="font-medium">{getAgencyName(trip.to)}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Tarih</span>
                <span className="font-medium">
                  {format(new Date(trip.departure), "dd.MM.yyyy HH:mm")}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Koltuklar</span>
                <span className="font-medium">{selectedSeats.join(", ")}</span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-gray-600 font-bold">Toplam Tutar</span>
                <span className="text-xl font-bold text-blue-600">
                  {totalAmount} TL
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PassengerFormPage;
