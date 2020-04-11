// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
    production: false,
    api_url: '',
    carwash_url: 'http://localhost:8080/carwashapi/getCarWash',
    display_package_items_url: '/assets/data/all-package-items.json',
    all_employees_url: '/assets/data/all-employees.json',
    // this is gonna bsubmit user infformtion to sign up and redirect to login page
    register_url: 'http://localhost:8080/signup',
    user_sign_in_url: 'http://localhost:8080/userProfile',
    signIn_url: 'http://localhost:8080/authenticate',
    logout_url: '',
    assets_url_base: '/assets/data/',
    geolocation_base_url: 'https://maps.googleapis.com/maps/api/geocode/json',
    GEOLOCATION_API_KEY: 'AIzaSyD7atM2VoIc3rVVUnDaTmxiFbPO6TVIkLc',
    new_store_url: 'http://localhost:8080/carwashapi/createInitCarWash',
    new_package_url: 'http://localhost:8080/carwashapi/addPackage',
    new_promotion_url: '',
    update_store_url: '',
    update_package_url: 'http://localhost:8080/carwashapi/updatePackage',
    update_package_array_url: '',
    update_promotion_url: '',
    delete_store_url: '',
    delete_package_url: '',
    delete_promotion_url: '',
    new_employee_url: '',
    update_employee_url: '',
    delete_employee_url: ''
};
