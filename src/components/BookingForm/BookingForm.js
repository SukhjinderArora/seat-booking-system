import styles from "./BookingForm.module.css";

const BookingForm = ({ onFormSubmit, seatsToBook, onChangeSeatsToBook }) => {
  return (
    <form onSubmit={onFormSubmit} className={styles.bookingForm}>
      <input
        type="number"
        placeholder="Enter Number of Seats to be Booked"
        className={styles.seatInput}
        min="1"
        max="6"
        value={seatsToBook}
        onChange={onChangeSeatsToBook}
      />
      <div>
        <button type="submit" className={styles.bookingSubmitButton}>
          Book Now
        </button>
      </div>
    </form>
  );
};

export default BookingForm;
