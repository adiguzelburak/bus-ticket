import { ModeToggle } from "../mode-toggle";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Navbar() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header className="flex items-center justify-between dark:bg-zinc-900 bg-zinc-100 rounded-lg p-4">
      <h1 className="text-2xl font-bold">{t("navbar.title")}</h1>
      <div className="flex items-center gap-4">
        <Select
          onValueChange={changeLanguage}
          defaultValue={i18n.language}
          value={i18n.language}
        >
          <SelectTrigger className="w-[110px] bg-background">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tr">Türkçe</SelectItem>
            <SelectItem value="en">English</SelectItem>
          </SelectContent>
        </Select>
        <ModeToggle />
      </div>
    </header>
  );
}
