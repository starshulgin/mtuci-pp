import './App.css'
import mtuci from './images/mtuci.jpg'
import back from './images/back.jpeg'
import './AdaptiveImage.css'

function App() {


interface AdaptiveImageProps {
  src: string;
  alt: string;
  mobileSrc?: string;
  tabletSrc?: string;
}

const AdaptiveImage: React.FC<AdaptiveImageProps> = ({ 
  src, 
  alt, 
  mobileSrc, 
  tabletSrc 
}) => {
  return (
    <picture>
      {/* Мобильные устройства */}
      {mobileSrc && (
        <source 
          media="(max-width: 768px)" 
          srcSet={mobileSrc} 
        />
      )}
      
      {/* Планшеты */}
      {tabletSrc && (
        <source 
          media="(max-width: 1024px)" 
          srcSet={tabletSrc} 
        />
      )}
      
      {/* Десктоп и fallback */}
      <img 
        src={src} 
        alt={alt}
        className="adaptive-img"
      />
    </picture>
  );
};


  return (
    <>
      <header className="header">
        <div className="logo"><img src={mtuci} alt="mtuci" /></div>
        <nav className="nav">
          <a href="#home" className="nav-link">HOME</a>
          <a href="#about" className="nav-link">ABOUT</a>
          <a href="#contacts" className="nav-link">CONTACTS</a>
        </nav>
        <div className="login"><a href="#login" className='link-login'>Login</a></div>
      </header>

      <main className="main-content">
        <div className="back">{AdaptiveImage}</div>
        <div className="college-info"></div>
      </main>
    </>
  )
}

export default App