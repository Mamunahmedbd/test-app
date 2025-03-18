<?php

namespace App\Http\Controllers;

use App\Models\MindMap;
use Illuminate\Http\Request;
use OpenAI\Laravel\Facades\OpenAI;
use Illuminate\Support\Facades\Log;
use OpenAI\Factory;
use GuzzleHttp\Client as GuzzleClient;
use Symfony\Component\HttpClient\HttpClient;

class MindMapController extends Controller
{
    public function generate(Request $request)
    {
        try {
            $request->validate([
                'content' => 'required|string',
                'title' => 'required|string',
                'settings' => 'nullable|array'
            ]);

            Log::info('Generating mind map', [
                'title' => $request->title,
                'content_length' => strlen($request->content)
            ]);

            // Create a custom HTTP client with SSL verification disabled
            $httpClient = new GuzzleClient([
                'verify' => false,
                'timeout' => 30,
            ]);

            // Create a new OpenAI client with the custom HTTP client
            $openAIClient = (new Factory())
                ->withApiKey(config('openai.api_key'))
                ->withOrganization(config('openai.organization'))
                ->withHttpClient($httpClient)
                ->make();

            $response = $openAIClient->chat()->create([
                'model' => 'gpt-4',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are a mind map generator. Your responses must be valid JSON only, with no additional text. Generate a structured mind map from the given content using this exact format: {"nodes": [{"title": "Main Topic", "children": [{"title": "Subtopic 1"}, {"title": "Subtopic 2", "children": [{"title": "Detail 1"}]}]}]}'
                    ],
                    [
                        'role' => 'user',
                        'content' => "Generate a mind map structure for the following content, responding with JSON only: {$request->content}"
                    ]
                ],
                'temperature' => 0.7,
                'max_tokens' => 2000
            ]);

            Log::info('OpenAI response received', [
                'response' => $response->choices[0]->message->content
            ]);

            $structure = json_decode($response->choices[0]->message->content, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception('Invalid JSON response from OpenAI: ' . json_last_error_msg());
            }

            $mindMap = MindMap::create([
                'title' => $request->title,
                'content' => $request->content,
                'structure' => $structure,
                'settings' => $request->settings ?? [
                    'maxDepth' => 3,
                    'style' => [
                        'centralNode' => ['color' => '#4A90E2'],
                        'primaryNodes' => ['color' => '#50C878'],
                        'secondaryNodes' => ['color' => '#FFB366'],
                        'tertiaryNodes' => ['color' => '#FF7F7F']
                    ]
                ]
            ]);

            return response()->json($mindMap);
        } catch (\Exception $e) {
            Log::error('Error generating mind map', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Failed to generate mind map',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function show(MindMap $mindMap)
    {
        return response()->json($mindMap);
    }
}