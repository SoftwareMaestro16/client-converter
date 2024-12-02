import React, { useState, useEffect } from "react";
import styles from ".././styles/App.module.css";
import Block from "./Block";
import prbIcon from ".././assets/prb-logo.jpg";
import sberIcon from ".././assets/sber-logo.jpeg";
import agroIcon from ".././assets/agro-logo.jpg";
import axios from "axios";
import { getCurrencies } from "./utils/getCurrencies";

type Rate = {
  ticker: string;
  buy: number;
  sell: number;
};

type Rates = {
  prb: Rate[] | null;
  sber: Rate[] | null;
  agro: Rate[] | null;
};

const App = () => {
  const [rates, setRates] = useState<Rates>({
    prb: null,
    sber: null,
    agro: null,
  });

  const [sellCurrency, setSellCurrency] = useState<string>("RUP");
  const [receiveCurrency, setReceiveCurrency] = useState<string>("USD");
  const [selectedBank, setSelectedBank] = useState<string>("PRB");
  const [sellAmount, setSellAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [conversionResult, setConversionResult] = useState<number>(0);

  useEffect(() => {
    const fetchRates = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get("http://localhost:3000/");
        const data = response.data;

        if (data) {
          const { agro, prb, sber } = data;

          setRates({
            prb: prb || null,
            sber: sber || null,
            agro: agro || null,
          });
        }
      } catch (error) {
        console.error("Ошибка при запросе данных:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRates();
  }, []);

  console.log(rates);
  
  const calculateConversion = (): number => {
    const selectedRates =
      selectedBank === "PRB"
        ? rates.prb
        : selectedBank === "SBER"
        ? rates.sber
        : rates.agro;
  
    if (!selectedRates) {
      console.error("Курсы не загружены для выбранного банка");
      return 0;
    }
  
    if (sellCurrency === "RUP") {
      const receiveRate = selectedRates.find((rate) => rate.ticker === receiveCurrency);
      if (!receiveRate) {
        console.error(`Курс для покупки ${receiveCurrency} не найден`);
        return 0;
      }
      return sellAmount / receiveRate.buy;
    }
  
    if (receiveCurrency === "RUP") {
      const sellRate = selectedRates.find((rate) => rate.ticker === sellCurrency);
      if (!sellRate) {
        console.error(`Курс для продажи ${sellCurrency} не найден`);
        return 0;
      }
      return sellAmount * sellRate.sell; 
    }
  
    const sellRate = selectedRates.find((rate) => rate.ticker === sellCurrency);
    const receiveRate = selectedRates.find((rate) => rate.ticker === receiveCurrency);
  
    if (!sellRate) {
      console.error(`Курс для продажи ${sellCurrency} не найден`);
      return 0;
    }
  
    if (!receiveRate) {
      console.error(`Курс для покупки ${receiveCurrency} не найден`);
      return 0;
    }
  
    return (sellAmount * sellRate.sell) / receiveRate.buy; 
  };

  useEffect(() => {
    if (!isLoading && rates) {
      const result = calculateConversion();
      setConversionResult(result);
    }
  }, [sellAmount, sellCurrency, receiveCurrency, selectedBank, rates, isLoading]);

  const handleCurrencyChange = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    otherSetter: React.Dispatch<React.SetStateAction<string>>,
    otherCurrency: string
  ) => (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCurrency = event.target.value;

    if (selectedCurrency === "RUP" && otherCurrency === "RUP") {
      return;
    }

    if (selectedCurrency !== "RUP" && otherCurrency !== "RUP") {
      otherSetter("RUP");
    }
    setter(selectedCurrency);
  };

  const handleSwap = () => {
    if (sellCurrency === "RUP" && receiveCurrency === "RUP") {
      setReceiveCurrency("USD");
    } else if (sellCurrency === "RUP") {
      setSellCurrency(receiveCurrency);
      setReceiveCurrency("RUP");
    } else {
      setSellCurrency("RUP");
      setReceiveCurrency(sellCurrency);
    }
  };

  const currencies = getCurrencies(selectedBank);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <h1>Загрузка курсов...</h1>
        <div className={styles.loadingSpinner}></div>
      </div>
    );
  }

  return (
    <div>
      <br />
      <h1 className={styles.mainText}>ПМР Конвертер</h1>
      <div className={styles.exchangeBlock}>
        <Block
          label="Продажа:"
          currencies={currencies}
          selectedCurrency={sellCurrency}
          onCurrencyChange={handleCurrencyChange(
            setSellCurrency,
            setReceiveCurrency,
            receiveCurrency
          )}
          amount={sellAmount}
          onAmountChange={(value: number) => setSellAmount(value)}
          isLoading={false}
        />
        <div className={styles.swapButton} onClick={handleSwap}>
          <img
            className={styles.imageSwap}
            src="https://cdn-icons-png.flaticon.com/512/7133/7133490.png"
            alt="⟷"
          />
        </div>
        <Block
          label="Покупка:"
          currencies={currencies}
          selectedCurrency={receiveCurrency}
          onCurrencyChange={handleCurrencyChange(
            setReceiveCurrency,
            setSellCurrency,
            sellCurrency
          )}
          amount={parseFloat(conversionResult.toFixed(4))}
          isLoading={false}
          onAmountChange={() => {}}
        />
      </div>

      <div className={styles.bankSelector}>
        <button
          className={`${styles.bankButton} ${
            selectedBank === "PRB" ? styles.activeBank : ""
          }`}
          onClick={() => setSelectedBank("PRB")}
        >
          <img src={prbIcon} alt="PRB" className={styles.bankIcon} />
        </button>
        <button
          className={`${styles.bankButton} ${
            selectedBank === "SBER" ? styles.activeBank : ""
          }`}
          onClick={() => setSelectedBank("SBER")}
        >
          <img src={sberIcon} alt="SBER" className={styles.bankIcon} />
        </button>
        <button
          className={`${styles.bankButton} ${
            selectedBank === "AGRO" ? styles.activeBank : ""
          }`}
          onClick={() => setSelectedBank("AGRO")}
        >
          <img src={agroIcon} alt="AGRO" className={styles.bankIcon} />
        </button>
      </div>
    </div>
  );
};

export default App;
