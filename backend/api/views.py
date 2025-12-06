import os
import pandas as pd
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .llm_service import LLMService

class AnalyzeView(APIView):
    def post(self, request):
        query = request.data.get('query', '')
        
        # Load data
        file_path = os.path.join(settings.BASE_DIR, 'data', 'real_estate_data.csv')
        try:
            if not os.path.exists(file_path):
                 return Response({'error': f"Data file not found at {file_path}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            df = pd.read_csv(file_path)
            
            # Basic query matching
            target_location = None
            locations = df['final location'].unique()
            
            # Simple keyword matching
            for loc in locations:
                if str(loc).lower() in query.lower():
                    target_location = loc
                    break
            
            if not target_location:
                 # Check if user asks for comparison or all - fallback to just listing available locations or error
                 available = ", ".join([str(l) for l in locations])
                 return Response({
                     'summary': f"Could not identify a specific location in your query. Available locations: **Akurdi**, **Ambegaon Budruk**, **Aundh**, **Wakad**. Please ensure your query contains one of these names."
                 })

            # Filter data
            filtered_df = df[df['final location'] == target_location].sort_values('year')
            
            # Prepare chart data
            # Handling NaN or missing values if any
            filtered_df = filtered_df.fillna(0)
            
            chart_data = {
                'years': filtered_df['year'].astype(str).tolist(),
                'prices': filtered_df['flat - weighted average rate'].tolist(),
                'sales': filtered_df['total sold - igr'].tolist()
            }
            
            # Prepare table data
            cols = ['year', 'final location', 'total sold - igr', 'flat - weighted average rate', 'flat - most prevailing rate - range']
            # Select only existing columns
            valid_cols = [c for c in cols if c in filtered_df.columns]
            
            table_data = {
                'headers': valid_cols,
                'rows': filtered_df[valid_cols].values.tolist()
            }
            
            # Generate Summary
            summary = LLMService.generate_summary(target_location, filtered_df)

            return Response({
                'summary': summary,
                'chart_data': chart_data,
                'table_data': table_data
            })

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
