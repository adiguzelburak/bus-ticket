import Layout from "@/components/common/layout";
import SearchPage from "@/pages/SearchPage";
import SeatSelectionPage from "@/pages/SeatSelectionPage";
import SummaryPage from "@/pages/SummaryPage";
import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Layout>
        <SearchPage />
      </Layout>
    ),
  },
  {
    path: "/seat-selection/:id",
    element: (
      <Layout>
        <SeatSelectionPage />
      </Layout>
    ),
  },
  {
    path: "/summary",
    element: (
      <Layout>
        <SummaryPage />
      </Layout>
    ),
  },
  {
    path: "/preview",
    element: <Layout>preview</Layout>,
  },
]);
