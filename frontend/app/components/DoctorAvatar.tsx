type Props = {
  gender: "male" | "female";
};

export default function DoctorAvatar({ gender }: Props) {
  return (
    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
      <svg
        width="34"
        height="34"
        viewBox="0 0 24 24"
        fill="#64748b"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z" />
        <path d="M12 14c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" />
      </svg>
    </div>
  );
}
