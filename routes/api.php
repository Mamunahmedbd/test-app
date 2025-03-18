<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MindMapController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/test', function (Request $request) {
    return response()->json('Hello World');
});

Route::post('/mindmap', [MindMapController::class, 'generate']);
Route::get('/mindmap/{mindMap}', [MindMapController::class, 'show']);
