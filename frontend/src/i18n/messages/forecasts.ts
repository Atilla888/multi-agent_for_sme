import { defineMessages } from "../define";

/** Interface text for the Forecasts screen. Forecasts are not ready yet, so the screen explains what is missing. */
export const forecasts = defineMessages({
  en: {
    title: "Forecasts",
    description: "Predicted sales for upcoming periods, kept separate from recorded figures.",
    banner: {
      title: "Forecasts are not ready yet",
      body: "A forecast needs a tested model and enough complete sales history. Until then nothing is predicted, so no one plans stock on made-up numbers.",
      openReports: "Open Reports",
    },
    restricted: { title: "You don't have access to forecasts", description: "Ask an owner or administrator if you need this." },
    missing: {
      title: "What is missing",
      model: { label: "Forecast model", value: "Not ready", note: "A model has to be trained and tested before it can predict anything." },
      history: { label: "Sales history", value: "Being collected", note: "Confirmed orders build up in Reports." },
      prediction: { label: "Prediction", value: "None", note: "No numbers are predicted until the model is ready." },
    },
    request: {
      title: "Request a forecast",
      body: "When forecasts are ready, you will choose a product, a measure and a period here.",
      button: "Request forecast",
      unavailable: "Not available yet. Nothing is requested from this screen.",
    },
    preview: {
      title: "How a forecast will be shown",
      lines: "Recorded sales and predicted sales drawn with different lines, so you always know which is which.",
      scope: "The product, measure and period the forecast covers.",
      confidence: "How confident the model is and what it did not take into account.",
      made: "When the forecast was made.",
      note: "This is a description only. It contains no prediction.",
    },
  },
  ru: {
    title: "Прогнозы",
    description: "Прогноз продаж на будущие периоды, отдельно от фактических данных.",
    banner: {
      title: "Прогнозы пока не готовы",
      body: "Для прогноза нужны проверенная модель и достаточно полная история продаж. До тех пор ничего не прогнозируется, чтобы никто не планировал запасы по выдуманным цифрам.",
      openReports: "Открыть отчёты",
    },
    restricted: { title: "У вас нет доступа к прогнозам", description: "Если вам это нужно, обратитесь к владельцу или администратору." },
    missing: {
      title: "Чего не хватает",
      model: { label: "Модель прогноза", value: "Не готова", note: "Модель нужно обучить и проверить, прежде чем она сможет что-то прогнозировать." },
      history: { label: "История продаж", value: "Собирается", note: "Подтверждённые заказы накапливаются в отчётах." },
      prediction: { label: "Прогноз", value: "Нет", note: "Пока модель не готова, никакие цифры не прогнозируются." },
    },
    request: {
      title: "Запросить прогноз",
      body: "Когда прогнозы будут готовы, здесь можно будет выбрать товар, показатель и период.",
      button: "Запросить прогноз",
      unavailable: "Пока недоступно. С этого экрана ничего не запрашивается.",
    },
    preview: {
      title: "Как будет выглядеть прогноз",
      lines: "Фактические и прогнозные продажи показаны разными линиями, чтобы всегда было понятно, где что.",
      scope: "Товар, показатель и период, к которым относится прогноз.",
      confidence: "Насколько модель уверена и что она не учла.",
      made: "Когда сделан прогноз.",
      note: "Это только описание. Прогноза здесь нет.",
    },
  },
  kk: {
    title: "Болжамдар",
    description: "Алдағы кезеңдерге арналған сатылым болжамы, нақты деректерден бөлек көрсетіледі.",
    banner: {
      title: "Болжамдар әлі дайын емес",
      body: "Болжам үшін тексерілген модель және жеткілікті толық сатылым тарихы қажет. Оған дейін ештеңе болжанбайды, сондықтан ешкім қорды ойдан шығарылған сандарға сүйеніп жоспарламайды.",
      openReports: "Есептерді ашу",
    },
    restricted: { title: "Болжамдарға рұқсатыңыз жоқ", description: "Бұл қажет болса, иесіне немесе әкімшіге хабарласыңыз." },
    missing: {
      title: "Не жетіспейді",
      model: { label: "Болжам моделі", value: "Дайын емес", note: "Модель бірдеңе болжай алуы үшін алдымен оқытылып, тексерілуі керек." },
      history: { label: "Сатылым тарихы", value: "Жиналуда", note: "Расталған тапсырыстар «Есептер» бөлімінде жиналады." },
      prediction: { label: "Болжам", value: "Жоқ", note: "Модель дайын болмайынша, ешқандай сан болжанбайды." },
    },
    request: {
      title: "Болжам сұрау",
      body: "Болжамдар дайын болғанда, осы жерде тауарды, көрсеткішті және кезеңді таңдайсыз.",
      button: "Болжам сұрау",
      unavailable: "Әлі қолжетімсіз. Бұл экраннан ештеңе сұралмайды.",
    },
    preview: {
      title: "Болжам қалай көрсетіледі",
      lines: "Нақты және болжамды сатылым әртүрлі сызықпен салынады, сондықтан қайсысы қайсы екенін әрдайым білесіз.",
      scope: "Болжам қамтитын тауар, көрсеткіш және кезең.",
      confidence: "Модельдің қаншалықты сенімді екені және нені ескермегені.",
      made: "Болжам қашан жасалғаны.",
      note: "Бұл тек сипаттама. Мұнда болжам жоқ.",
    },
  },
});
