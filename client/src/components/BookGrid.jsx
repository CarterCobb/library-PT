import React from "react";
import { useSpring, animated } from "@react-spring/web";

const BookCard = ({ book }) => {
  const [props, set] = useSpring(() => ({
    xys: [0, 0, 1],
    config: { mass: 1, tension: 150, friction: 25 },
  }));

  const calc = (x, y, rect) => [
    -(y - rect.top - rect.height / 2) / 20,
    (x - rect.left - rect.width / 2) / 20,
    1,
  ];

  const trans = (x, y, s) =>
    `perspective(2000px) rotateX(${x}deg) rotateY(${y}deg) scale(${s})`;

  return (
    <animated.a
      href={`/book/${book.isbn}`}
      onMouseMove={({ clientX: x, clientY: y, ...e }) => {
        const rect = e.currentTarget.getBoundingClientRect();
        set.start({ xys: calc(x, y, rect) });
      }}
      onMouseLeave={() => set.start({ xys: [0, 0, 1] })}
      style={{
        transform: props.xys.to(trans),
      }}
    >
      {/* START CUSTOM */}
      <div className="cc-book-card">
        <img src={book.image} />
        <h3>{book.title}</h3>
        
        <p className="desc">{book.description}</p>
        <p>ISBN:{" "}{book.isbn}</p>
      </div>
      {/* END CUSTOM */}
    </animated.a>
  );
};

const BookGrid = ({ books }) => {
  return (
    <div className="book-grid-container">
      {books
        .sort(() => 0.5 - Math.random())
        .map((book) => (
          <BookCard book={book} key={book.id} key={book.isbn}/>
        ))}
    </div>
  );
};

export default BookGrid;
