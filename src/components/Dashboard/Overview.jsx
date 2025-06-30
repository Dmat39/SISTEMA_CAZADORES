import { Icon } from "@mdi/react";
import { icons } from "../../plugins/IconLibrary";
import { useEffect, useState } from "react";
import { countSummary } from "../../api/dashboard/DashboardApi";
import { toast } from "sonner";

const Overview=()=>{
    const [incidences, setIncidences] = useState(0);
    const [process, setProcess] = useState(0);
    const [completeds, setCompleteds] = useState(0);
    const [finisheds, setFinisheds] = useState(0);
    const [operators, setOperators] = useState(0);
    const [supervisors, setSupervisors] = useState(0);

    const fetchSummary=async()=>{
        try {
            const response=await countSummary();
            setIncidences(response.data.data.incidenceCount);
            setProcess(response.data.data.processCount);
            setCompleteds(response.data.data.completedCount);
            setFinisheds(response.data.data.finishedCount);
            setSupervisors(response.data.data.supervisorCount);
            setOperators(response.data.data.operatorCount);
        } catch (error) {
            toast.error("Error al obtener el resumen: "+error.message)               
        }
    }

    useEffect(()=>{
        fetchSummary();
    },[]);
    return(
        <div className="flex justify-center md:justify-between flex-wrap gap-4 text-center text-sm sm-text-base md:text-lg bg-white rounded-xl shadow-md p-6">
            <div className="bg-[#FFF4DE] w-25 md:w-auto rounded-2xl p-2 sm:p-4">
                <div className="flex flex-col md:flex-row items-center">
                    <Icon path={icons.mdiFileDocument} size={1} className="bg-[#FF947A] rounded-full p-1 text-white" />
                    <div className="pl-2 md:pl-4 font-semibold">Incidencias</div>
                </div>
                <div className="py-1 sm:py-4 text-xl md:text-3xl lg:text-4xl font-bold">
                    {incidences}
                </div>
            </div>
            <div className="bg-[#DEF0FF] w-25 md:w-auto rounded-2xl p-2 sm:p-4">
                <div className="flex flex-col md:flex-row items-center">
                    <Icon path={icons.mdiClock} size={1} className="bg-[#007DD6] rounded-full p-1 text-white" />
                    <div className="pl-2 md:pl-4 font-semibold">En proceso</div>
                </div>
                <div className="py-1 sm:py-4 text-xl md:text-3xl lg:text-4xl font-bold">
                    {process}
                </div>
            </div>
            <div className="bg-[#e5ffde] w-25 md:w-auto rounded-2xl p-2 sm:p-4">
                <div className="flex flex-col md:flex-row items-center">
                    <Icon path={icons.mdiCheckBold} size={1} className="bg-[#45af00] rounded-full p-1 text-white" />
                    <div className="pl-2 md:pl-4 font-semibold">Completados</div>
                </div>
                <div className="py-1 sm:py-4 text-xl md:text-3xl lg:text-4xl font-bold">
                    {completeds}
                </div>
            </div>
            <div className="bg-[#FFE2E5] w-25 md:w-auto rounded-2xl p-2 sm:p-4">
                <div className="flex flex-col md:flex-row items-center">
                    <Icon path={icons.mdiFlag} size={1} className="bg-[#FA5A7D] rounded-full p-1 text-white" />
                    <div className="pl-2 md:pl-4 font-semibold">Finalizados</div>
                </div>
                <div className="py-1 sm:py-4 text-xl md:text-3xl lg:text-4xl font-bold">
                    {finisheds}
                </div>
            </div>
            <div className="bg-[#C2F7FF] w-25 md:w-auto rounded-2xl p-2 sm:p-4">
                <div className="flex flex-col md:flex-row items-center">
                    <Icon path={icons.mdiAccountGroup} size={1} className="bg-[#3CB8CC] rounded-full p-1 text-white" />
                    <div className="pl-2 md:pl-4 font-semibold">Operadores</div>
                </div>
                <div className="py-1 sm:py-4 text-xl md:text-3xl lg:text-4xl font-bold">
                    {operators}
                </div>
            </div>
            <div className="bg-[#f8dcff] w-25 md:w-auto rounded-2xl p-2 sm:p-4">
                <div className="flex flex-col md:flex-row items-center">
                    <Icon path={icons.mdiAccountGroup} size={1} className="bg-[#a03ccc] rounded-full p-1 text-white" />
                    <div className="pl-2 md:pl-4 font-semibold">Supervisores</div>
                </div>
                <div className="py-1 sm:py-4 text-xl md:text-3xl lg:text-4xl font-bold">
                    {supervisors}
                </div>
            </div>
            
        </div>
    );
}
export default Overview;