<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DisplayController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

// Display pages
Route::get('/home/homepage', [DisplayController::class, 'displayHomepage'])->name('home.homepage');
Route::get('/recipes/cucur-pulo', [DisplayController::class, 'displayCucurPulo'])->name('recipes.cucur-pulo');
