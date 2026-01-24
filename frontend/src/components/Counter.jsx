import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement, reset, selectCount } from '../features/counterSlice';

function Counter() {
  const count = useSelector(selectCount);
  const dispatch = useDispatch();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Redux Counter</h2>
      <div className="flex items-center justify-center gap-4 mb-4">
        <button
          onClick={() => dispatch(decrement())}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          -
        </button>
        <span className="text-4xl font-bold text-gray-800 min-w-[60px] text-center">
          {count}
        </span>
        <button
          onClick={() => dispatch(increment())}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          +
        </button>
      </div>
      <button
        onClick={() => dispatch(reset())}
        className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
      >
        Reset
      </button>
    </div>
  );
}

export default Counter;
