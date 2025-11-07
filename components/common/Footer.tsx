import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full text-center p-4 mt-8">
      <p className="text-xs text-neutral-gray-dark">
        Desenvolvido por{' '}
        <a
          href="https://wa.me/5555981584424"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline text-neutral-gray"
        >
          3ºSgt Ezequiel FAGUNDES
        </a>
      </p>
    </footer>
  );
};
