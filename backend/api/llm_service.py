from django.conf import settings
import openai
import os

class LLMService:
    @staticmethod
    def generate_summary(location, filtered_df):
        """
        Generates a summary for the given location and data.
        If OPENAI_API_KEY is present in settings, uses OpenAI.
        Otherwise, returns a mock summary.
        """
        
        # Calculate Mock Stats
        min_year = filtered_df['year'].min()
        max_year = filtered_df['year'].max()
        avg_price = filtered_df['flat - weighted average rate'].mean()
        total_sales_sum = filtered_df['total sold - igr'].sum()
        max_price_row = filtered_df.loc[filtered_df['flat - weighted average rate'].idxmax()]
        
        # Mock Summary (Fallback)
        mock_summary = (
            f"**Analysis for {location} ({min_year}-{max_year})**\n\n"
            f"Over the last {max_year - min_year + 1} years, {location} has seen significant real estate activity. "
            f"The total recorded sales volume stands at {total_sales_sum} units. "
            f"The average weighted rate for flats is approximately {avg_price:,.2f}. "
            f"The market peaked in terms of price in {max_price_row['year']}."
        )

        # Real LLM Integration
        api_key = getattr(settings, 'OPENAI_API_KEY', None) or os.environ.get('OPENAI_API_KEY')
        if api_key:
            try:
                from openai import OpenAI
                client = OpenAI(api_key=api_key)
                
                prompt = (
                    f"Analyze real estate market trends for {location} based on the following data summary: "
                    f"Years: {min_year} to {max_year}, "
                    f"Total Sales: {total_sales_sum}, "
                    f"Average Flat Rate: {avg_price:.2f}, "
                    f"Peak Price Year: {max_price_row['year']}. "
                    f"Provide a concise, professional analysis highlighting growth and demand trends."
                )
                
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are a real estate market analyst."},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=150
                )
                return response.choices[0].message.content
            except Exception as e:
                print(f"DEBUG: LLM Error: {e}")
                return mock_summary

        return mock_summary

