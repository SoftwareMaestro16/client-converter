import React, { useState, useEffect, useRef } from "react";
import styles from ".././styles/Block.module.css";

import usdFlag from ".././assets/usd-flag.jpg";
import eurFlag from ".././assets/eur-flag.jpg";
import rubFlag from ".././assets/rub-flag.jpg";
import mdlFlag from ".././assets/mdl-flag.jpg";
import uahFlag from ".././assets/uah-flag.jpg";
import rupFlag from ".././assets/pmr-flag.jpg";
import gbpFlag from ".././assets/gbp-flag.jpg";
import plnFlag from ".././assets/pln.jpg";
import chfFlag from ".././assets/chf-flag.jpg";
import bgnFlag from ".././assets/bgn.jpg";
import ronFlag from ".././assets/ron-flag.jpg";
import aedFlag from ".././assets/aed-flag.jpg";
import cnyFlag from ".././assets/cny-flag.jpeg";
import jpyFlag from ".././assets/jpy-flag.jpeg";
import tryFlag from ".././assets/try-flag.jpg";
import bynFlag from ".././assets/byn-flag.jpg";

interface BlockProps {
  label: string;
  currencies: string[];
  selectedCurrency: string;
  onCurrencyChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  amount: number;
  onAmountChange: (value: number) => void;
  isLoading?: boolean; 
}

const flagMap: { [key: string]: string } = {
  USD: usdFlag,
  EUR: eurFlag,
  RUB: rubFlag,
  MDL: mdlFlag,
  UAH: uahFlag,
  RUP: rupFlag,
  GBP: gbpFlag,
  PLN: plnFlag,
  CHF: chfFlag,
  BGN: bgnFlag,
  RON: ronFlag,
  AED: aedFlag,
  CNY: cnyFlag,
  JPY: jpyFlag,
  TRY: tryFlag,
  BYN: bynFlag
};

const Block: React.FC<BlockProps> = ({
  label,
  currencies,
  selectedCurrency,
  onCurrencyChange,
  amount,
  onAmountChange,
}) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  const handleCurrencySelect = (currency: string) => {
    onCurrencyChange({
      target: { value: currency },
    } as React.ChangeEvent<HTMLSelectElement>);
    setDropdownOpen(false);
  };

  return (
    <div>
      <label className={styles.labelText}>{label}</label>
      <div className={styles.currencySelector} ref={dropdownRef}>
        <input
          type="number"
          className={styles.inputField}
          placeholder="0"
          value={amount || ""}
          onChange={(e) => onAmountChange(Number(e.target.value))}
        />
        <div
          className={styles.customDropdown}
          onClick={() => setDropdownOpen(!isDropdownOpen)}
        >
          <div className={styles.selectedCurrency}>
            <img
              src={flagMap[selectedCurrency]}
              alt={`${selectedCurrency} flag`}
              className={styles.flagImage}
            />
            {selectedCurrency}
          </div>
          {isDropdownOpen && (
            <ul className={styles.dropdownList}>
              {currencies.map((currency) => (
                <li
                  key={currency}
                  className={styles.dropdownItem}
                  onClick={() => handleCurrencySelect(currency)}
                >
                  <img
                    src={flagMap[currency]}
                    alt={`${currency} flag`}
                    className={styles.flagImage}
                  />
                  {currency}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Block;