'''
    api.py
    Angela Ellis and Marc Donnelly
    22 November 2020

    Flask API to support the NPS Species web application.
'''

import sys
import flask
import json
import config
import psycopg2

########### Initializing Flask ###########
api = flask.Blueprint('api', __name__)

########### Utility functions ###########
def get_connection():
    ''' Returns a connection to the database described in the
        config module. May raise an exception as described in the
        documentation for psycopg2.connect. '''
    return psycopg2.connect(database=config.database,
                            user=config.user,
                            password=config.password)


########### The API endpoints ###########
@api.route('/individual_species/<scientific_name>')
def get_individual_species_page(scientific_name):
    '''
    Returns a dictionary where the keys refer to characteristics of a single species.
    Takes the scientific name as a parameter.
    '''
    individual_species = {}
    query = f'''SELECT species.scientific_name, species_common_names.common_name, parks.name,
                        categories.name, orders.name, families.name, genera.name, abundance.name, 
                        nativeness.name, seasonality.name, occurrence.name, conservation_status.name 
                    FROM species, species_common_names, categories, orders, families, genera,              
                         abundance, nativeness, seasonality, occurrence, conservation_status, parks 
                    WHERE species.scientific_name = '{scientific_name}'
                        AND species.species_id = species_common_names.species_id
                        AND species.park_id = parks.park_id
                        AND species.category_id = categories.id
                        AND species.order_id = orders.id
                        AND species.family_id = families.id
                        AND species.genus_id = genera.id
                        AND species.order_id = orders.id
                        AND species.abundance_id = abundance.id
                        AND species.nativeness_id = nativeness.id
                        AND species.seasonality_id = seasonality.id
                        AND species.occurrence_id = occurrence.id
                        AND species.conservation_status_id = conservation_status.id        
             '''
    try:
        connection = get_connection()
        cursor = connection.cursor()
        cursor.execute(query)
        for row in cursor:
            individual_species = {"Scientific Name": row[0], "Common Name": row[1], "Park": row[2], "Category": row[3], "Order": row[4], "Family": row[5], "Genus": row[6], "Abundance": row[7], "Nativeness": row[8], "Seasonality": row[9], "Occurrence": row[10], "Conservation Status": row[11]}
        cursor.close()
        connection.close()
    except Exception as e:
        print(e, file=sys.stderr)
    return json.dumps(individual_species)
    
    

@api.route('/classifications/categories')
def get_categories():
    '''
    Returns a list of all the category values.
    (e.g., mammal, bird, fish, etc)
    '''
    categories = []
    query = 'SELECT categories.name FROM categories ORDER BY categories.name'
    try:
        connection = get_connection()
        cursor = connection.cursor()
        cursor.execute(query)
        for row in cursor:
            categories += row
        cursor.close()
        connection.close()
    except Exception as e:
        print(e, file=sys.stderr)
    return json.dumps(categories)



@api.route('/children/<classification_type>/<classification_value>')
def get_children(classification_type, classification_value):
    '''
    Returns a list of all the children of the classification_value.
    (e.g., if classification_value is 'bird' of the classification_type 'Category',
    a list of bird orders will be returned [Passeriformes, Galliformes, etc])
    '''
    if "_" in classification_value:
        slashed_classification_value = classification_value.replace('_', '/')
        correct_classification_value = slashed_classification_value
    else:
        correct_classification_value = classification_value
    parent_classification_type = classification_type #'category'
    if parent_classification_type == 'category':
        child_classification_type = 'order'
        child_classification_table_name = 'orders'
        parent_classification_table_name = 'categories'
    elif parent_classification_type == 'order':
        child_classification_type = 'family'
        child_classification_table_name = 'families'
        parent_classification_table_name = 'orders'
    elif parent_classification_type == 'family':
        child_classification_type = 'genus'
        child_classification_table_name = 'genera'
        parent_classification_table_name = 'families'  
    query = f''' SELECT DISTINCT {child_classification_table_name}.name
                     FROM {child_classification_table_name}, species, {parent_classification_table_name}
                         WHERE {parent_classification_table_name}.name = '{correct_classification_value}'
                         AND species.{parent_classification_type}_id = {parent_classification_table_name}.id
                         AND species.{child_classification_type}_id = {child_classification_table_name}.id
                            ORDER BY {child_classification_table_name}.name
            '''
    children = []
    try:
        connection = get_connection()
        cursor = connection.cursor()
        cursor.execute(query)
        for row in cursor:
            if row and row not in children:
                if None not in row:
                    children += row
        cursor.close()
        connection.close()
    except Exception as e:
        print(e, file=sys.stderr)
    return json.dumps(children)



@api.route('/species/<table_name>/<classification_value>')
def get_species(table_name, classification_value):
    '''
    Returns a list of all the species of the <classification_value>.
    '''
    classification_type = ''
    if table_name == 'categories':
        classification_type = 'category'
    elif table_name == 'orders':
        classification_type = 'order'
    elif table_name == 'families':
        classification_type = 'family'
    elif table_name == 'genera':
        classification_type = 'genus'
    query = f''' SELECT DISTINCT species.scientific_name
                    FROM species, {table_name}
                    WHERE {table_name}.name = '{classification_value}'
                        AND species.{classification_type}_id = {table_name}.id
                    ORDER BY species.scientific_name
            '''
    species = []
    try:
        connection = get_connection()
        cursor = connection.cursor()
        cursor.execute(query)
        for row in cursor:
            name = str(row).split(' ')
            if len(name) == 2:
                species += row
        cursor.close()
        connection.close()
    except Exception as e:
        print(e, file=sys.stderr)
    return json.dumps(species)



'''
@api.route('/characteristics/')
def get_characteristics():
    ''''''
    !!!!!PART OF THE SPECIES INFO TAB THAT NEVER GOT IMPLEMENTED!!!!!
    Returns a list of all available characteristics on the species
    in the database
    ''''''
    characteristics = []
    query = 'SELECT * FROM characteristics'
    try:
        connection = get_connection()
        cursor = connection.cursor()
        cursor.execute(query)
        for row in cursor:
            characteristics += row
        cursor.close()
        connection.close()
    except Exception as e:
        print(e, file=sys.stderr)
    return json.dumps(characteristics)
'''


