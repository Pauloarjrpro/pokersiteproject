import Routers from './routers';
import ThemeProvider from './theme';
import ScrollToTop from './components/ScrollToTop';
import NotistackProvider from './components/NotistackProvider';

function App() {
  return (
    <>
      <ThemeProvider>

        <ScrollToTop />
        <NotistackProvider>
            <Routers />
        </NotistackProvider>
      </ThemeProvider>
    </>
  );
}

export default App;
