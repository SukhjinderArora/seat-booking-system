import { useEffect, useState, useRef } from "react";

import BookingForm from "./components/BookingForm/BookingForm";
import SeatsLayout from "./components/SeatsLayout/SeatsLayout";

import styles from "./App.module.css";

function App() {
  /**
   *  State for the input element
   */
  const [seatsToBook, setSeatsToBook] = useState("");
  const isInitialMount = useRef(true);

  const totalSeatsCount = 80;
  const totalRowsCount = 12;
  const totalColumnsCount = Math.ceil(totalSeatsCount / totalRowsCount);

  const setInitialRows = () => {
    const rowsArray = new Array(totalRowsCount);
    let seatNumber = 1;
    for (let i = 0; i < totalRowsCount; i++) {
      rowsArray[i] = [];
      for (let j = 0; j < totalColumnsCount; j++) {
        if (seatNumber <= totalSeatsCount) {
          rowsArray[i].push({
            seatNumber,
            booked: false,
          });
        } else {
          rowsArray[i].push(null);
        }
        seatNumber++;
      }
    }
    return rowsArray;
  };

  /**
   * State to track the rows
   * Eg: [[{seatNumber: 1, booked: false},{seatNumber: 2, booked: false}...],[{...},{...}], [],[]]
   * The first element in the array contains row 1 and so on
   */
  const [rows, setRows] = useState(setInitialRows);

  const setInitialEmptySeats = () => {
    const emptySeatsArray = new Array(totalRowsCount);
    for (let i = 0; i < totalRowsCount; i++) {
      emptySeatsArray[i] = [i, rows[i].filter((el) => el !== null).length];
    }
    return emptySeatsArray;
  };

  /**
   * State to track empty seats in rows. Eg: [[0, 7]... [11, 7]]
   * Here the first element in the nested array is row number and the second element
   *  is the number of seats empty in that row
   */
  const [emptySeats, setEmptySeats] = useState(setInitialEmptySeats);

  /**
   * This state contains the seat numbers of the booked seats
   * Eg. [71, 72, 73, 74]
   */
  const [bookedSeats, setBookedSeats] = useState([]);

  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  /**
   * Get the the state from localstorage on mount if available
   */
  useEffect(() => {
    const bookingState = JSON.parse(localStorage.getItem("bookingData"));
    if (bookingState) {
      setRows(bookingState.rows);
      setEmptySeats(bookingState.emptySeats);
    }
  }, []);

  /**
   * Save the state in local storage whenever the state is modified
   */
  useEffect(() => {
    if (!isInitialMount.current) {
      localStorage.setItem(
        "bookingData",
        JSON.stringify({
          rows,
          emptySeats,
          bookedSeats,
          message,
          error,
        })
      );
    }
    isInitialMount.current = false;
  }, [rows, emptySeats, bookedSeats, message, error]);

  /**
   *  Display a success message after a user successfully books the seat(s).
   */
  useEffect(() => {
    if (bookedSeats.length > 0) {
      setError(false);
      setMessage(
        `${
          bookedSeats.length
        } seats booked successfully. Booked seat numbers are ${bookedSeats.join(
          ", "
        )}`
      );
    }
  }, [bookedSeats]);

  /**
   * Removes the success message after some time.
   */
  useEffect(() => {
    if (message) {
      setTimeout(() => {
        setMessage("");
        setError(false);
        setBookedSeats([]);
      }, 1500);
    }
  }, [message]);

  /**
   * Function used to book seats.
   * @param {number} rowIndex
   * @param {number} startIndex
   * @param {number} seatsCount
   * @returns {[number]}
   */
  const bookSeats = (rowIndex, startIndex, seatsCount) => {
    const bookedSeats = [];
    setRows((prevState) => {
      const newRows = prevState.map((row) => [...row]);
      const selectedRow = newRows[rowIndex].map((seat) =>
        seat ? { ...seat } : null
      );
      for (let i = startIndex; i < startIndex + seatsCount; i++) {
        selectedRow[i].booked = true;
      }
      newRows[rowIndex] = selectedRow;
      return newRows;
    });
    setEmptySeats((prevState) => {
      const updatedEmptySeats = [...prevState].map((arr) => [...arr]);
      updatedEmptySeats[rowIndex] = [
        rowIndex,
        prevState[rowIndex][1] - seatsCount,
      ];
      return updatedEmptySeats;
    });
    for (let i = startIndex; i < startIndex + seatsCount; i++) {
      bookedSeats.push(rows[rowIndex][i].seatNumber);
    }
    setBookedSeats((prevState) => {
      const updatedBookedSeats = [...prevState, ...bookedSeats];
      return updatedBookedSeats;
    });
    return bookedSeats;
  };

  /**
   * Event Handler for the input element
   * @param {Event} evt
   */
  const seatsToBookChangeHandler = (evt) => {
    setSeatsToBook(Number(evt.target.value));
  };

  /**
   * Submit Event Handler for the booking form
   * @param {Event} evt
   * @returns
   */
  const handleBookingForm = (evt) => {
    evt.preventDefault();

    setBookedSeats([]);
    setError(false);
    setMessage("");

    if (seatsToBook > 6) {
      setError(true);
      setMessage("You can book maximum of 6 seats in one booking!");
      return;
    }
    if (seatsToBook < 1) {
      setError(true);
      setMessage("You must book minimum of 1 seat in one booking!");
      return;
    }
    const totalEmptySeats = emptySeats.reduce((acc, cur) => {
      return acc + cur[1];
    }, 0);

    if (totalEmptySeats < seatsToBook) {
      setError(true);
      setMessage("Required seats are not available!!");
      return;
    }

    for (let [row, emptySeatsInRow] of emptySeats) {
      if (emptySeatsInRow >= seatsToBook) {
        /**
         * This code will execute when the seats requested can be fit in a single row
         */
        bookSeats(
          row,
          rows[row].filter((el) => el !== null).length - emptySeatsInRow,
          seatsToBook
        );
        return;
      }
    }

    /**
     * This code will execute when the seats requested cannot be fit in a single row
     */
    const sortedEmptySeats = [...emptySeats]
      .map((row) => [...row])
      .sort((a, b) => (b[1] - a[1] === 0 ? a[0] - b[0] : b[1] - a[1]));

    let remainingSeatsToBook = seatsToBook;

    for (let [row, emptySeatsInRow] of sortedEmptySeats) {
      if (remainingSeatsToBook <= 0) {
        return;
      }
      if (remainingSeatsToBook >= emptySeatsInRow) {
        bookSeats(
          row,
          rows[row].filter((el) => el !== null).length - emptySeatsInRow,
          emptySeatsInRow
        );
        remainingSeatsToBook = remainingSeatsToBook - emptySeatsInRow;
      } else {
        bookSeats(
          row,
          rows[row].filter((el) => el !== null).length - emptySeatsInRow,
          remainingSeatsToBook
        );
        remainingSeatsToBook = 0;
      }
    }
  };

  /**
   * Event handler for the reset button
   */
  const resetButtonHandler = () => {
    setRows(setInitialRows());
    setEmptySeats(setInitialEmptySeats);
    setBookedSeats([]);
    setMessage("");
    setError(false);
  };

  return (
    <div className={styles.appContainer}>
      <div className={styles.leftContainer}>
        <BookingForm
          seatsToBook={seatsToBook}
          onChangeSeatsToBook={seatsToBookChangeHandler}
          onFormSubmit={handleBookingForm}
        />
      </div>
      <div className={styles.middleContainer}>
        <SeatsLayout rows={rows} message={message} error={error} />
      </div>
      <div className={styles.rightContainer}>
        <div>
          <div className={styles.blockContainer}>
            <span className={styles.bookedBlock}></span>
            <span>Booked</span>
          </div>
          <div className={styles.blockContainer}>
            <span className={styles.availableBlock}></span>
            <span>Available</span>
          </div>
        </div>
        <div>
          <button
            type="button"
            onClick={resetButtonHandler}
            className={styles.resetButton}
          >
            Reset Bookings
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
