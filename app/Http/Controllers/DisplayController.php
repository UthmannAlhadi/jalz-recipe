<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DisplayController extends Controller
{
    //
    public function displayHomepage()
    {
        return view('home.homepage');
    }
    public function displayCucurPulo()
    {
        return view('recipes.cucur-pulo');
    }
}
