const adultizm = 568080000000;

const isUserAdult = (birthDate) => {
  const bD = birthDate.split("/");
  const currAge = new Date() - new Date(`${bD[1]}-${bD[0]}-${bD[2]}`);
  if (currAge > adultizm) return true;
  return false;
};

module.exports = isUserAdult;
