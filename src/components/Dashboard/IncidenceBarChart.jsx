import { useState, useEffect, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, format, isWithinInterval, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { incidenceChart } from "../../api/dashboard/DashboardApi";

const IncidenceBarChart = () => {
const [rawData, setRawData] = useState([]);
const [filter, setFilter] = useState("week");
const [activePeriod, setActivePeriod] = useState(null);

useEffect(() => {
    incidenceChart()
    .then(({ data }) => {
        if (data.status && data.data) setRawData(data.data);
    })
    .catch(console.error);
}, []);

useEffect(() => {
    const today = new Date();
    if (filter === "week") setActivePeriod(format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd"));
    if (filter === "month") setActivePeriod(format(today, "yyyy-MM"));
    if (filter === "year") setActivePeriod(format(today, "yyyy"));
}, [filter]);

const chartData = useMemo(() => {
    const grouped = {};

    rawData.forEach((item) => {
        const d = parseISO(item.date);
        let key;

        if (filter === "week" && activePeriod) {
            const start = parseISO(activePeriod);
            const end = endOfWeek(start, { weekStartsOn: 1 });

            if (!isWithinInterval(d, { start, end })) return;

            key = format(d, "EEE dd", { locale: es });
        }

        if (filter === "month" && activePeriod) {
            const [year, month] = activePeriod.split("-");
            const start = startOfMonth(parseISO(`${year}-${month}-01`));
            const end = endOfMonth(start);

            if (!isWithinInterval(d, { start, end })) return;

            const weekIndex = Math.floor((d.getDate() - 1) / 7) + 1;
            key = `Semana ${weekIndex}`;
        }

        if (filter === "year" && activePeriod) {
            const start = startOfYear(new Date(activePeriod, 0));
            const end = endOfYear(start);
            if (!isWithinInterval(d, { start, end })) return;

            key = format(d, "MMM", { locale: es });
        }

        if (!grouped[key]) {
            grouped[key] = { label: key, process: 0, completado: 0, finalizado: 0 };
        }

        grouped[key][
            item.status === "process"
            ? "process"
            : item.status === "completed"
            ? "completado"
            : "finalizado"
        ]++;
    });

    let data = Object.values(grouped);

    if (filter === "week") {
        const weekdayOrder = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];
        data.sort((a, b) => {
            const aDay = a.label.split(" ")[0].toLowerCase();
            const bDay = b.label.split(" ")[0].toLowerCase();
            return weekdayOrder.indexOf(aDay) - weekdayOrder.indexOf(bDay);
        });
    }
    
    if (filter === "month") {
        data.sort((a, b) => {
        const aNum = parseInt(a.label.replace("Semana ", ""));
        const bNum = parseInt(b.label.replace("Semana ", ""));
        return aNum - bNum;
        });
    }

    return data;
}, [rawData, filter, activePeriod]);

const periodOptions =
    filter === "week"
    ? Array.from({ length: 4 }, (_, i) => {
        const start = startOfWeek(new Date(), { weekStartsOn: 1 });
        const wStart = new Date(start.getTime() - i * 7 * 86400000);
        return {
            label: `Semana ${format(wStart, "dd MMM", { locale: es })}`,
            value: format(wStart, "yyyy-MM-dd"),
        };
        })
    : filter === "month"
    ? ["0", "1", "2", "3"].map((_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        return {
            label: format(d, "MMMM yyyy", { locale: es }),
            value: format(d, "yyyy-MM"),
        };
    })
    : ["0", "1", "2", "3"].map((_, i) => {
        const y = new Date().getFullYear() - i;
        return { label: y.toString(), value: y.toString() };
    });

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload || !payload.length) return null;
        const order = { process: 1, completado: 2, finalizado: 3 };
        const sorted = [...payload].sort((a, b) => order[a.dataKey] - order[b.dataKey]);

        return (
            <div className="bg-white border border-gray-300 text-xs shadow-md p-2 rounded-md">
            <p className="font-semibold mb-1">{label}</p>
            {sorted.map((entry, index) => (
                <div key={index} className="flex justify-between" style={{ color: entry.color }}>
                <span>
                    {entry.dataKey === "process"
                    ? "En proceso"
                    : entry.dataKey === "completado"
                    ? "Completado"
                    : "Finalizado"}
                </span>
                <span className="pl-1">{entry.value}</span>
                </div>
            ))}
            </div>
        );
    };
    
    const LegendSquare = ({ color, label }) => (
    <div className="flex items-center">
        <span className="w-5 h-5 rounded-full" style={{ backgroundColor: color }} />
        <span className="ml-1">{label}</span>
    </div>
    );

    return (
        <div className="bg-white rounded-xl shadow-md p-6 mt-4 max-w-140 w-full">
            <div className="flex flex-wrap justify-between mb-4 gap-2">
                <h1 className="text-lg font-semibold">Incidencias</h1>
                <div className="flex gap-2 flex-wrap">
                <select value={filter} onChange={(e) => setFilter(e.target.value)} className="p-2 border w-24 rounded">
                    <option value="week">Semana</option>
                    <option value="month">Mes</option>
                    <option value="year">Año</option>
                </select>
                <select value={activePeriod} onChange={(e) => setActivePeriod(e.target.value)} className="p-2 border w-37 rounded">
                    {periodOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                    ))}
                </select>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={200} className="max-w-[470px]">
                <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="process" fill="#0095FF" radius={[5, 5, 0, 0]} />
                <Bar dataKey="completado" fill="#00E096" radius={[5, 5, 0, 0]} />
                <Bar dataKey="finalizado" fill="#F64E60" radius={[5, 5, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>

            <div className="flex gap-4 justify-center mt-4 flex-wrap">
                <LegendSquare color="#0095FF" label="En proceso" />
                <LegendSquare color="#00E096" label="Completado" />
                <LegendSquare color="#F64E60" label="Finalizado" />
            </div>
        </div>
    );
};
export default IncidenceBarChart;