interface ProductBadgeProps {
  isNovo?: boolean;
  emPromocao?: boolean;
  className?: string;
}

export default function ProductBadge({ isNovo, emPromocao, className = '' }: ProductBadgeProps) {
  if (!isNovo && !emPromocao) return null;

  return (
    <div className={`absolute top-2 left-2 flex flex-col gap-1 z-10 ${className}`}>
      {isNovo && (
        <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded shadow-md">
          NOVO
        </span>
      )}
      {emPromocao && (
        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow-md">
          PROMOÇÃO
        </span>
      )}
    </div>
  );
}
