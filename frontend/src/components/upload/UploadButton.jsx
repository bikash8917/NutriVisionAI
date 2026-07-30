import Button from '../common/Button';

export default function UploadButton({ children, ...props }) {
  return <Button {...props}>{children}</Button>;
}
