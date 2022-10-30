import styles from "./SeatsLayout.module.css";

const SeatsLayout = ({ rows, message, error }) => {
  return (
    <div className={styles.seatsContainer}>
      <div>
        {rows.map((row, i) => (
          <div className={styles.row} key={i}>
            {row.map((seat, j) =>
              seat ? (
                <span
                  className={`${styles.seat} ${
                    seat.booked ? styles.booked : ""
                  }`}
                  key={seat.seatNumber}
                >
                  {seat.seatNumber}
                </span>
              ) : (
                <span className={`${styles.seat} ${styles.disabled}`} key={j}>
                  X
                </span>
              )
            )}
          </div>
        ))}
      </div>
      <div
        className={`${styles.message} ${message ? styles.messageVisible : ""} ${
          error ? styles.errorMessage : ""
        }`}
      >
        <div>{message}</div>
      </div>
    </div>
  );
};

export default SeatsLayout;
