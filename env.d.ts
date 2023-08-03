namespace NodeJS {
	interface ProcessEnv {
		PASSWORD_SALT: string
	}
  }

  declare module '*.module.css' {
    const classes: { [key: string]: string};
    export default classes;
}