import { NextResponse } from 'next/server';
import { checkDevAssets } from '../../lib/devBypassServer';

export async function GET() {
  try {
    const result = await checkDevAssets();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error checking dev assets:', error);
    return NextResponse.json(
      { 
        shouldBypass: false,
        availableAssets: {},
        missingAssets: [],
        reason: 'Error checking dev assets'
      },
      { status: 500 }
    );
  }
}