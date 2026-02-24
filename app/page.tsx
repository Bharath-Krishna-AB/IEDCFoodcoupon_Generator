import styles from './page.module.css';
import RegistrationFlow from '../components/registration/RegistrationFlow';

export default function Home() {
  return (
    <div className={styles.pageContainer}>
      <RegistrationFlow />
    </div>
  );
}
