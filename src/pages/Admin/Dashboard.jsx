
import IncidenceAreaChart from "../../components/Dashboard/IncidenceAreaChart"
import IncidenceBarChart from "../../components/Dashboard/IncidenceBarChart"
import Overview from "../../components/Dashboard/overview"

const DashboardAdmin = () => {
  return (
    <div className="m-4 ">
      <Overview/>
      <div className="flex flex-wrap gap-2">
        <IncidenceBarChart/>
        <IncidenceAreaChart/>
      </div>
    </div>
  )
}

export default DashboardAdmin