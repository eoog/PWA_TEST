import Swal from "sweetalert2";

export const showImageModal = (image) => {
  return Swal.fire({
    imageUrl: image.data,
    imageAlt: `검출된 이미지 ${image.id}`,
    title: `검출된 이미지 ${image.id}`,
    width: '80%',
    padding: '1em',
    showConfirmButton: false,
    showCloseButton: true,
    backdrop: `rgba(0, 0, 0, 0.8)`,
    customClass: {
      image: 'max-h-[80vh] object-contain'
    }
  });
};
