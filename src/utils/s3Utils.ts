export const getFileUrl = (fileName: string, firebaseUserId: string): string => {
    const bucket = 'vascoandco-storage';
    return `https://${bucket}.s3.eu-north-1.amazonaws.com/${firebaseUserId}/${fileName}`;
  };
  