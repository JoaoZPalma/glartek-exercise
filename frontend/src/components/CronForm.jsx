import { useState, useEffect } from "react";

const range = (start, end) => Array.from({ length: end - start + 1 }, (_, i) => start + i);

const weekdaysNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const monthsNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const timeZones = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/Lisbon",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney"
];

export default function CronForm({ editingCron, onSave, onCancel }) {
  const [name, setName] = useState("");
  const [uri, setUri] = useState("");
  const [httpMethod, setHttpMethod] = useState("POST");
  const [enabled, setEnabled] = useState(true);

  const [minutes, setMinutes] = useState([]);
  const [hours, setHours] = useState([]);
  const [days, setDays] = useState([]);
  const [months, setMonths] = useState([]);
  const [weekdays, setWeekdays] = useState([]);
  const [timeZone, setTimeZone] = useState(
    editingCron?.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [body, setBody] = useState(editingCron?.body || '');

  const [advancedCron, setAdvancedCron] = useState("");
  const [useAdvanced, setUseAdvanced] = useState(false);

  const [dragStart, setDragStart] = useState(null);
  const [dragField, setDragField] = useState(null);

  const [activeField, setActiveField] = useState("minutes");

  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    if (editingCron) {
      setName(editingCron.name || "");
      setUri(editingCron.uri || "");
      setHttpMethod(editingCron.httpMethod || "POST");
      setEnabled(editingCron.enabled ?? true);
      setTimeZone(editingCron.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone);
      setBody(editingCron.body || '');

      if (editingCron.schedule) {
        const [m, h, d, mo, w] = editingCron.schedule.split(" ");
        setMinutes(m === "*" ? [] : m.split(",").map(Number));
        setHours(h === "*" ? [] : h.split(",").map(Number));
        setDays(d === "*" ? [] : d.split(",").map(Number));
        setMonths(mo === "*" ? [] : mo.split(",").map(Number));
        setWeekdays(w === "*" ? [] : w.split(",").map(Number));
        setAdvancedCron(editingCron.schedule);
      }
    }
  }, [editingCron]);

  const toggleValue = (arr, val, setArr) => {
    if (arr.includes(val)) setArr(arr.filter((x) => x !== val));
    else setArr([...arr, val]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Use advanced cron if enabled, otherwise build from checkboxes
    const schedule = useAdvanced && advancedCron.trim() !== ""
      ? advancedCron.trim()
      : `${minutes.length ? minutes.join(",") : "*"} ${hours.length ? hours.join(",") : "*"} ${days.length ? days.join(",") : "*"} ${months.length ? months.join(",") : "*"} ${weekdays.length ? weekdays.join(",") : "*"}`;

    onSave({
      _id: editingCron?._id,
      name,
      uri,
      httpMethod,
      enabled,
      schedule,
      timeZone,
      body
    });

    if (editingCron) {
      clearFields();
    }
  };

  const renderCheckboxGrid = (label, values, state, setState, names, shift = 0) => {
    const handleMouseDown = (val) => {
      setDragStart(val);
      setDragField({ state, setState });
      toggleValue(state, val, setState);
    };

    const handleMouseEnter = (val) => {
      if (dragStart === null || !dragField) return;

      const { state, setState } = dragField;
      const start = dragStart;
      const end = val;

      const minVal = Math.min(start, end);
      const maxVal = Math.max(start, end);

      const rangeToToggle = values.filter(v => v >= minVal && v <= maxVal);

      // Determine whether we are adding or removing based on dragStart
      const adding = !state.includes(dragStart);

      const newState = adding
        ? Array.from(new Set([...state, ...rangeToToggle]))
        : state.filter(v => !rangeToToggle.includes(v));

      setState(newState);
    };

    const handleMouseUp = () => {
      setDragStart(null);
      setDragField(null);
    };

    const clearField = () => setState([]);

    return (
      <div className="my-4">
        <div className="flex justify-between items-center my-4">
          <label className="font-semibold">{label}</label>
          <button type="button" onClick={clearField} className="text-sm px-2 py-0.5 bg-gray-200 rounded hover:bg-gray-300">Limpar campo</button>
        </div>
        <div
          className="grid grid-cols-[repeat(auto-fill,40px)] gap-1 justify-center"
          onMouseLeave={handleMouseUp}
          onMouseUp={handleMouseUp}
        >
          {/* Star button */}
          <div
            key="star"
            onMouseDown={() => setState([])}
            className={`cursor-pointer w-10 h-10 flex items-center justify-center rounded border ${state.length === 0 ? "bg-blue-600 text-white" : "bg-white text-black"} hover:bg-blue-300`}
          >
            *
          </div>
          {/* Value buttons */}
          {values.map((v) => {
            const isChecked = state.includes(v);
            return (
              <div
                key={v}
                onMouseDown={() => handleMouseDown(v)}
                onMouseEnter={() => handleMouseEnter(v)}
                className={`select-none cursor-pointer w-10 h-10 flex items-center justify-center rounded border ${isChecked ? "bg-blue-600 text-white" : "bg-white text-black"} hover:bg-blue-300`}
              >
                <input type="checkbox" value={v} checked={isChecked} readOnly className="hidden" />
                {names ? names[v - shift] : v}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const fields = [
    { key: "minutes", label: "Minutos", values: range(0, 59), state: minutes, setState: setMinutes },
    { key: "hours", label: "Horas", values: range(0, 23), state: hours, setState: setHours },
    { key: "days", label: "Dias", values: range(1, 31), state: days, setState: setDays },
    { key: "months", label: "Meses", values: range(1, 12), state: months, setState: setMonths, names: monthsNames, shift: 1 },
    { key: "weekdays", label: "Dias da Semana", values: range(0, 6), state: weekdays, setState: setWeekdays, names: weekdaysNames },
  ];

  const clearFields = () => {
    setName('');
    setUri('');
    setHttpMethod('POST');
    setEnabled(true);
    setMinutes([]);
    setHours([]);
    setDays([]);
    setMonths([]);
    setWeekdays([]);
    setAdvancedCron('');
    setUseAdvanced(false);
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setBody('');
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white max-w-xl mx-auto">

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">
          {editingCron ? "Editar CRON" : "Criar Novo CRON"}
        </h2>

        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="mr-2 w-5 h-5 accent-blue-600"
          />
          Ativo
        </label>
      </div>
      {/* Name */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* URI */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">URI</label>
        <input
          type="text"
          value={uri}
          onChange={(e) => setUri(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* HTTP Method */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">HTTP Method</label>
        <select
          value={httpMethod}
          onChange={(e) => setHttpMethod(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option>POST</option>
          <option>GET</option>
          <option>PUT</option>
          <option>DELETE</option>
        </select>
      </div>


      <div className="mb-4">
        <label className="block font-semibold mb-1">Request Body (JSON)</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder='{"key": "value"}'
          className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          rows={4}
        />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Time Zone</label>
        <select
          value={timeZone}
          onChange={(e) => setTimeZone(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {timeZones.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </div>
      {/* Advanced Cron Toggle */}
      <div className="mb-2">
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={useAdvanced}
            onChange={(e) => setUseAdvanced(e.target.checked)}
            className="mr-2 w-5 h-5 accent-blue-600"
          />
          Usar Expressão CRON Avançada
        </label>
        {useAdvanced && (
          <input
            type="text"
            value={advancedCron}
            onChange={(e) => setAdvancedCron(e.target.value)}
            placeholder="* * * * *"
            className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        )}
      </div>

      {!useAdvanced && (
        <>
          {/* Field navigation */}
          <div className="flex gap-2 my-4 justify-center">
            {fields.map(f => (
              <button
                key={f.key}
                type="button"
                onClick={() => setActiveField(f.key)}
                className={`px-3 py-1 rounded-full font-medium transition-colors ${activeField === f.key
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-200 hover:bg-gray-300"
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold text-lg">CRON Schedule</h2>
            <button
              type="button"
              onClick={() => setShowTip(!showTip)}
              className="text-sm px-2 py-0.5 bg-gray-200 rounded hover:bg-gray-300"
            >
              Dica
            </button>
          </div>

          {showTip && (
            <p className="text-sm text-gray-600 mb-4 p-2 bg-gray-100 rounded border">
              É possível arrastar ao longo dos checkboxes para selecionar múltiplos valores de uma vez!
            </p>
          )}
          {/* Render only active field */}
          {fields.map(f =>
            f.key === activeField &&
            renderCheckboxGrid(f.label, f.values, f.state, f.setState, f.names, f.shift || 0)
          )}
        </>
      )}

      {/* Buttons */}
      <div className="flex gap-3 mt-6 justify-center">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition-colors"
        >
          {editingCron ? "Atualizar" : "Criar"}
        </button>

        {editingCron ? (
          <button
            type="button"
            onClick={() => {
              clearFields();
              onCancel();
            }}
            className="bg-gray-200 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
        ) : (
          <button
            type="button"
            onClick={clearFields}
            className="bg-gray-200 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Limpar tudo
          </button>
        )}
      </div>
    </form>
  );
}
